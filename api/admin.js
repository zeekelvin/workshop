export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  // Simple password protection
  const auth = req.headers['x-admin-key'];
  if (auth !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sb = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sb || !key) return res.status(500).json({ error: 'Config missing' });

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  try {
    const [bookingsRes, viewsRes, nicheRes] = await Promise.all([
      fetch(`${sb}/rest/v1/workshop_bookings?select=*&order=created_at.desc`, { headers }),
      fetch(`${sb}/rest/v1/workshop_page_views?select=page,created_at&order=created_at.desc&limit=500`, { headers }),
      fetch(`${sb}/rest/v1/niche_gen_sessions?select=created_at,situation&order=created_at.desc&limit=100`, { headers }),
    ]);

    const [bookings, views, niches] = await Promise.all([
      bookingsRes.json(),
      viewsRes.json(),
      nicheRes.json(),
    ]);

    // Page view stats
    const viewsByPage = {};
    const viewsByDay = {};
    if (Array.isArray(views)) {
      views.forEach(v => {
        viewsByPage[v.page] = (viewsByPage[v.page] || 0) + 1;
        const day = v.created_at?.slice(0, 10);
        if (day) viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });
    }

    // Booking stats
    const commitmentCounts = {};
    const sourceCounts = {};
    if (Array.isArray(bookings)) {
      bookings.forEach(b => {
        if (b.commitment) commitmentCounts[b.commitment] = (commitmentCounts[b.commitment] || 0) + 1;
        if (b.source) sourceCounts[b.source] = (sourceCounts[b.source] || 0) + 1;
      });
    }

    return res.status(200).json({
      bookings: Array.isArray(bookings) ? bookings : [],
      stats: {
        total_bookings: Array.isArray(bookings) ? bookings.length : 0,
        total_views: Array.isArray(views) ? views.length : 0,
        niche_gen_uses: Array.isArray(niches) ? niches.length : 0,
        views_by_page: viewsByPage,
        views_by_day: viewsByDay,
        commitment_breakdown: commitmentCounts,
        source_breakdown: sourceCounts,
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
