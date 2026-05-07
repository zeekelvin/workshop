# ZagaPrime AI Power Workshop — Live Website

## What's Included

| File | Purpose |
|------|---------|
| `index.html` | Main landing page — hero, curriculum, pricing, niche generator, discovery form |
| `resources.html` | Resources hub — free downloads, AI tools directory, membership tiers |
| `admin.html` | Password-protected analytics dashboard — bookings, views, charts |
| `api/generate.js` | Claude AI niche generator (serverless) |
| `api/booking.js` | Discovery form submissions → Supabase + email (serverless) |
| `api/track.js` | Page view tracker (serverless) |
| `api/admin.js` | Admin data API — protected by ADMIN_KEY (serverless) |

## ✅ Already Done (No Action Needed)

- Supabase database tables created:
  - `workshop_bookings` — all form submissions
  - `workshop_page_views` — page visit tracking
  - `niche_gen_sessions` — AI generator usage
- Supabase URL and anon key pre-filled in `.env.example`

## Deploy in 5 Steps

### Step 1 — Get your API keys (10 minutes)

**Anthropic API Key** (for niche generator):
1. Go to console.anthropic.com
2. Click API Keys → Create Key
3. Copy it

**Supabase Service Role Key** (for admin dashboard reads):
1. Go to supabase.com → your project
2. Settings → API
3. Copy the `service_role` key (NOT the anon key)

**Resend API Key** (for email notifications when someone books):
1. Go to resend.com → Sign up free
2. Create an API key
3. Add and verify `zagaprime.com` as your domain (or use the default resend domain for testing)

**Admin Password**:
- Just pick any strong password. You'll use this to log into /admin

### Step 2 — Fill in your env file

Copy `.env.example` to `.env.local` and fill in the 4 values.

### Step 3 — Deploy

**Option A — Script (easiest):**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B — Manual Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel deploy --prod
# When asked to configure env vars, add all 6 values from .env.local
```

**Option C — Vercel Dashboard (no terminal):**
1. Push this folder to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. In "Environment Variables," add all 6 values from .env.example
4. Click Deploy

### Step 4 — Add your custom domain (optional)

In Vercel dashboard → Project → Settings → Domains:
- Add `workshop.zagaprime.com` or `academy.zagaprime.com`

### Step 5 — Set up email domain in Resend (for professional emails)

In Resend dashboard → Domains → Add `zagaprime.com`
Add the DNS records Resend gives you to your domain registrar.
This makes booking emails come from `noreply@zagaprime.com`.

## Your Admin Dashboard

Once deployed, go to: `yoursite.com/admin`

Enter your ADMIN_KEY password to see:
- Total bookings, page views, niche generator usage
- Daily traffic chart (14-day trend)
- Commitment level breakdown (who's "All in" 🔥)
- How people found you (referral sources)
- Full booking table with names, emails, goals
- CSV export button

## Environment Variables Summary

| Variable | Where to Get It | Required |
|----------|----------------|---------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Yes (niche generator) |
| `SUPABASE_URL` | Already filled: `https://gjstebjvrebvaxeslblo.supabase.co` | Yes |
| `SUPABASE_ANON_KEY` | Already filled in .env.example | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Yes (admin dashboard) |
| `RESEND_API_KEY` | resend.com | Yes (email notifications) |
| `ADMIN_KEY` | You choose | Yes (admin login) |

## After Deployment — Test Everything

1. ✅ Visit the homepage — check the page view counter fires (check Supabase)
2. ✅ Run the niche generator with test data
3. ✅ Submit the discovery form with your own email — you should receive the notification
4. ✅ Check /admin with your password — booking should appear
5. ✅ Click "Export CSV" — downloads your bookings

## Updating the Site

Just edit the HTML files and re-run `vercel deploy --prod`. No build step needed.

---
Built by ZagaPrime LLC | kzee@zagaprime.com
