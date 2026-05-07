export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;
  if (!data?.email || !data?.first_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sb = process.env.SUPABASE_URL;
  // Prefer service role (bypasses RLS, returns inserted row) if available; fall back to anon.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const useServiceRole = serviceKey && !serviceKey.includes('your_service_role_key_here');
  const key = useServiceRole ? serviceKey : anonKey;
  const resendKey = process.env.RESEND_API_KEY;

  let bookingId = null;

  // 1. Save to Supabase. Anon role only has INSERT policy (no SELECT) so we
  // can't request return=representation unless we're using the service role.
  try {
    const r = await fetch(`${sb}/rest/v1/workshop_bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': useServiceRole ? 'return=representation' : 'return=minimal'
      },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name || '',
        email: data.email,
        phone: data.phone || null,
        situation: data.situation || null,
        business_description: data.description || null,
        challenge: data.challenge || null,
        ai_needs: data.aiNeeds || [],
        goal: data.goal || null,
        commitment: data.commitment || null,
        preferred_timing: data.timing || null,
        source: data.source || null,
        notes: data.notes || null,
        status: 'new'
      })
    });
    if (r.ok && useServiceRole) {
      const saved = await r.json();
      bookingId = saved?.[0]?.id;
    } else if (!r.ok) {
      console.error('Supabase insert failed:', r.status, await r.text());
    }
  } catch (e) {
    console.error('Supabase save error:', e);
  }

  // 2. Send email notification via Resend
  if (resendKey) {
    const aiNeedsList = Array.isArray(data.aiNeeds) ? data.aiNeeds.join(', ') : '';
    const fromAddress = process.env.RESEND_FROM || 'ZagaPrime Workshop <noreply@zagaprimeai.com>';
    const toAddress = process.env.BOOKING_NOTIFICATION_EMAIL || 'zagaprime@gmail.com';
    const adminUrl = process.env.ADMIN_DASHBOARD_URL || 'https://workshop-three-iota.vercel.app/admin';
    const emailBody = `
<h2 style="color:#C4622D">New Discovery Call Booking — ZagaPrime Workshop</h2>
<table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:180px">Name</td><td style="padding:8px">${data.first_name} ${data.last_name}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${data.email}">${data.email}</a></td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Phone</td><td style="padding:8px;background:#f5f5f5">${data.phone || 'Not provided'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Situation</td><td style="padding:8px">${data.situation || '—'}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Business / Idea</td><td style="padding:8px;background:#f5f5f5">${data.description || '—'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Biggest Challenge</td><td style="padding:8px">${data.challenge || '—'}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">AI Needs</td><td style="padding:8px;background:#f5f5f5">${aiNeedsList || '—'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Goal</td><td style="padding:8px">${data.goal || '—'}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Commitment Level</td><td style="padding:8px;background:#f5f5f5"><strong>${data.commitment || '—'}</strong></td></tr>
  <tr><td style="padding:8px;font-weight:bold">Best Time</td><td style="padding:8px">${data.timing || '—'}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">How They Found Us</td><td style="padding:8px;background:#f5f5f5">${data.source || '—'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Notes</td><td style="padding:8px">${data.notes || '—'}</td></tr>
  <tr><td style="padding:8px;background:#fff3e0;font-weight:bold">Submitted</td><td style="padding:8px;background:#fff3e0">${new Date().toLocaleString('en-US',{timeZone:'America/New_York'})}</td></tr>
</table>
<p style="margin-top:16px;font-size:12px;color:#666">Booking ID: ${bookingId || 'pending'} | View all bookings in your <a href="${adminUrl}">Admin Dashboard</a></p>
    `.trim();

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: fromAddress,
          to: [toAddress],
          reply_to: data.email,
          subject: `🗓 New Discovery Call: ${data.first_name} ${data.last_name} — ${data.commitment || 'New Lead'}`,
          html: emailBody
        })
      });
    } catch (e) {
      console.error('Email send error:', e);
    }
  }

  return res.status(200).json({ success: true, id: bookingId });
}
