export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).end();

  const { page, referrer, session_id } = req.body || {};
  const sb = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!sb || !key) return res.status(200).json({ ok: true });

  try {
    await fetch(`${sb}/rest/v1/workshop_page_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        page: page || '/',
        referrer: referrer || null,
        user_agent: req.headers['user-agent'] || null,
        session_id: session_id || null
      })
    });
  } catch (e) {}

  return res.status(200).json({ ok: true });
}
