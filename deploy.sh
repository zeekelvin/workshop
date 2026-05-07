#!/bin/bash
# ZagaPrime Workshop Site — One-Command Deploy Script
# Run this from inside the zagaprime-workshop folder
# Prerequisites: Node.js installed, Vercel CLI (npm i -g vercel)

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ZagaPrime Workshop Site — Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required env vars file
if [ ! -f ".env.local" ]; then
  echo ""
  echo "⚠️  No .env.local found. Creating from template..."
  cp .env.example .env.local
  echo ""
  echo "📝 Please open .env.local and fill in:"
  echo "   1. ANTHROPIC_API_KEY"
  echo "   2. SUPABASE_SERVICE_ROLE_KEY (from supabase.com > project settings > API)"
  echo "   3. RESEND_API_KEY (free at resend.com)"
  echo "   4. ADMIN_KEY (choose any password for your admin dashboard)"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "✓ Environment file found"

# Load env vars
export $(grep -v '^#' .env.local | xargs)

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

echo "Deploying to Vercel..."
echo ""

# Deploy - will prompt for login on first run
vercel deploy --prod \
  --team zagas-projects-ef111f51 \
  --yes \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e SUPABASE_URL="$SUPABASE_URL" \
  -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  -e RESEND_API_KEY="$RESEND_API_KEY" \
  -e ADMIN_KEY="$ADMIN_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ DEPLOYED!"
echo ""
echo "  Your site is live."
echo "  Admin dashboard: yoursite.vercel.app/admin"
echo "  Admin password: $ADMIN_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
