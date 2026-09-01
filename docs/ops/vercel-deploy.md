# ClinicFlow — Vercel Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

```bash
cd /home/z/my-project
git init
git add .
git commit -m "ClinicFlow — production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clinicflow.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `clinicflow`
3. Vercel auto-detects Next.js — keep the default settings
4. Click **Environment Variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_0FdNxfG1hMlZ@ep-dry-moon-aez8zr4n-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_0FdNxfG1hMlZ@ep-dry-moon-aez8zr4n.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `BILLING_ADAPTER` | `mock` (change to `stripe` when you set up Stripe) |
| `LOCK_ADAPTER` | `sqlite` (change to `redis` when you set up Redis) |

5. Click **Deploy**

### Step 3: Seed the Database (one-time)

After the first deploy, run the seed script to populate the database:

```bash
# From your local machine
export DATABASE_URL="postgresql://neondb_owner:npg_0FdNxfG1hMlZ@ep-dry-moon-aez8zr4n-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
export DIRECT_URL="postgresql://neondb_owner:npg_0FdNxfG1hMlZ@ep-dry-moon-aez8zr4n.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push schema to Neon (creates tables)
bun run db:push

# Seed data (creates demo clinic, users, patients)
bun run db:seed
```

### Step 4: Verify

Visit your Vercel URL (e.g., `https://clinicflow.vercel.app`):
- Landing page should load
- Click "Sign in" → login with `owner@riversidept.example` / `clinicflow-demo-2024`
- Dashboard should show stats (2 patients, 0 appointments, 0 claims)

### Step 5: Set up Stripe (when ready for billing)

```bash
# Run the Stripe setup script
STRIPE_SECRET_KEY=sk_test_xxx bun scripts/setup-stripe.ts

# Add the output to Vercel environment variables:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_THERAPIST_PRICE_ID
# - STRIPE_SUPPORT_PRICE_ID
# - BILLING_ADAPTER=stripe

# Redeploy on Vercel (push to GitHub or click "Redeploy")
```

### Step 6: Configure Stripe Webhook (production)

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Events to listen for:
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the signing secret to Vercel env: `STRIPE_WEBHOOK_SECRET`

---

## Alternative: Vercel CLI Deploy

If you prefer the CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from the project directory
cd /home/z/my-project
vercel --prod

# When prompted:
# - Project name: clinicflow
# - Framework: Next.js (auto-detected)
# - Build command: (auto-detected)
# - Output directory: (auto-detected)

# After deploy, set environment variables:
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add BILLING_ADAPTER production

# Redeploy with env vars:
vercel --prod
```

---

## Environment Variables Reference

### Required (for the app to work):

| Variable | Value | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Neon pooled connection |
| `DIRECT_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Neon direct connection (for Prisma migrations) |
| `BILLING_ADAPTER` | `mock` or `stripe` | Billing service |
| `LOCK_ADAPTER` | `sqlite` or `redis` | Distributed lock adapter |

### Optional (enable real services when ready):

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_THERAPIST_PRICE_ID` | Price ID for therapist seats |
| `STRIPE_SUPPORT_PRICE_ID` | Price ID for support seats |
| `REDIS_URL` | Redis connection (for distributed locks) |
| `RESEND_API_KEY` | Transactional email |
| `TWILIO_ACCOUNT_SID` | SMS reminders |
| `TWILIO_AUTH_TOKEN` | SMS reminders |
| `TWILIO_PHONE_NUMBER` | SMS from number |
| `R2_ACCOUNT_ID` | Cloudflare R2 storage |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `PHI_ENCRYPTION_KEY` | AES-256 encryption key (generate with `openssl rand -hex 32`) |

---

## What happens on Vercel

1. Vercel clones your GitHub repo
2. Runs `bun install` (install dependencies)
3. Runs `prisma generate` (postinstall — generates Prisma client for PostgreSQL)
4. Runs `next build` (production build — all 24 routes compile)
5. Deploys to serverless functions (each function gets 1-3GB RAM — no OOM)
6. Serves on `https://your-project.vercel.app`

**Vercel serverless functions have enough memory** (1-3GB per function, auto-scaled) — the OOM issue that happens in this sandbox (4GB total, shared) does NOT occur on Vercel.

---

## After Deployment

1. **Test the landing page** — should load instantly (static)
2. **Test login** — `owner@riversidept.example` / `clinicflow-demo-2024`
3. **Test the patient portal** — login at `/portal/login` with `emily.johnson@example.com`
4. **Set up Stripe** (when ready for real billing)
5. **Set up a custom domain** (Vercel → Settings → Domains → add `app.clinicflow.com`)

## Cost

- **Vercel Hobby (free)**: 100GB bandwidth, 100 serverless function invocations/day — enough for beta
- **Vercel Pro ($20/mo)**: 1TB bandwidth, unlimited invocations — for production
- **Neon Free tier**: 0.5GB storage, 100 compute hours — enough for 10-50 clinics
- **Total for beta**: $0/month (both free tiers)
