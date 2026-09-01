# ClinicFlow — Service Account Setup Guide

This guide walks you through setting up each external service for production.
Follow the steps in order. Each service takes 5-10 minutes.

## Prerequisites
- Neon PostgreSQL database (✅ already set up)
- Domain name (e.g., app.clinicflow.com)

---

## 1. Stripe (Payment Processing)

**Purpose:** Subscription billing ($49/therapist, $19/support) + patient bill pay.

### Setup Steps:
1. Go to https://dashboard.stripe.com/register
2. Create an account (use your business email)
3. Complete business verification (required for live payments)
4. Get your API keys:
   - Test mode: https://dashboard.stripe.com/test/apikeys
   - Live mode: https://dashboard.stripe.com/apikeys (after verification)

### Automated Setup:
```bash
# Test mode (safe — no real charges):
STRIPE_SECRET_KEY=sk_test_xxx bun scripts/setup-stripe.ts

# This creates:
#   - 3 products (Therapist $49, Support $19, Portal Free)
#   - 3 recurring monthly prices
#   - A webhook endpoint with the correct events
#   - Outputs all env vars you need
```

### Copy output to .env:
```bash
BILLING_ADAPTER=stripe
STRIPE_SECRET_KEY=sk_test_xxx        # or sk_live_xxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxx      # from the setup script
STRIPE_THERAPIST_PRICE_ID=price_xxx  # from the setup script
STRIPE_SUPPORT_PRICE_ID=price_xxx    # from the setup script
```

### Verify:
```bash
# Test that the adapter loads:
bun -e "require('./src/lib/ports/billing.stripe'); console.log('✅ Stripe adapter loads')"
```

---

## 2. Cloudflare R2 (Document Storage)

**Purpose:** Patient documents, exercise handouts, intake forms, exported reports.
S3-compatible API with zero egress fees.

### Setup Steps:
1. Go to https://dash.cloudflare.com → R2 Object Storage
2. Enable R2 (requires Cloudflare account + payment method)
3. Create a bucket:
   - Name: `clinicflow-prod` (or `clinicflow-staging`)
   - Location: Auto (Cloudflare picks the closest region)
4. Get API credentials:
   - Go to R2 → Manage R2 API Tokens
   - Create API token with "Object Read & Write" permission
   - Copy: Account ID, Access Key ID, Secret Access Key

### Copy to .env:
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=clinicflow-prod
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### Verify:
```bash
bun -e "
const { getStorage } = require('./src/lib/ports/storage.r2');
const storage = getStorage();
storage.presignUpload('test.txt', 'text/plain').then(r => console.log('✅ R2 works:', r.url));
"
```

---

## 3. Resend (Transactional Email)

**Purpose:** Appointment confirmations, reminders, welcome emails, password resets.

### Setup Steps:
1. Go to https://resend.com → Sign up
2. Verify your email address
3. Add + verify your sending domain:
   - Go to Domains → Add Domain
   - Enter: `clinicflow.com` (or your domain)
   - Add the DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually 5-15 minutes)
4. Get your API key:
   - Go to API Keys → Create API Key
   - Copy: `re_xxxxxxxxxxxx`

### Copy to .env:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="ClinicFlow <noreply@clinicflow.com>"
```

### Verify:
```bash
bun -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: 'ClinicFlow <noreply@clinicflow.com>',
  to: 'your@email.com',
  subject: 'Test from ClinicFlow',
  html: '<p>If you see this, email is working!</p>'
}).then(r => console.log('✅ Email sent:', r.data?.id));
"
```

---

## 4. Twilio (SMS Reminders)

**Purpose:** SMS appointment reminders (24h before + 2h before).

### Setup Steps:
1. Go to https://www.twilio.com/console → Sign up
2. Get a phone number:
   - Go to Phone Numbers → Buy a number
   - Search for a number in your area code
   - Buy it (~$1.15/month)
3. Get your credentials:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Phone Number: `+1XXXXXXXXXX`

### Copy to .env:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### Verify:
```bash
bun -e "
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.messages.create({
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+1YOUR_PHONE_NUMBER',
  body: 'Test from ClinicFlow — SMS is working!'
}).then(r => console.log('✅ SMS sent:', r.sid));
"
```

---

## 5. Stripe Webhook Configuration

**Purpose:** Receive Stripe events (invoice paid, subscription updated/deleted) idempotently.

### For Local Development (testing webhooks locally):
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to your local server:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# It will output:
#   > Ready! Your webhook signing secret is: whsec_xxx
# Copy this to your .env as STRIPE_WEBHOOK_SECRET
```

### For Production:
1. The setup script (`scripts/setup-stripe.ts`) creates the webhook endpoint automatically
2. Or create it manually:
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `invoice.paid`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
3. Copy the signing secret to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### Verify webhook works:
```bash
# After deploying, test with a Stripe test event:
stripe trigger invoice.paid

# Check your server logs — you should see:
#   [stripe-webhook] Processed event: invoice.paid
```

---

## Complete .env.production Template

After setting up all services, your .env should look like:

```bash
# Database (Neon)
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:xxx@ep-xxx.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Redis (optional — for production distributed locks)
# If you don't have Redis yet, the system uses SQLite locks (single-process only)
# REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
# LOCK_ADAPTER="redis"

# Stripe
BILLING_ADAPTER=stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_THERAPIST_PRICE_ID=price_xxx
STRIPE_SUPPORT_PRICE_ID=price_xxx

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=clinicflow-prod
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM="ClinicFlow <noreply@clinicflow.com>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.clinicflow.com

# Encryption (generate with: openssl rand -hex 32)
PHI_ENCRYPTION_KEY=xxx
```

## Setup Order (Recommended)

1. ✅ Neon database (done)
2. Stripe (billing is core to the product)
3. Cloudflare R2 (needed for document uploads)
4. Resend (needed for appointment reminders)
5. Twilio (needed for SMS reminders)
6. Deploy
7. Configure Stripe webhook to production URL
