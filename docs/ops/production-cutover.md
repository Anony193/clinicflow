# ClinicFlow — Production Cutover Runbook

## Pre-Cutover Checklist

- [ ] Neon PostgreSQL database provisioned
- [ ] Redis (Upstash or Redis Cloud) provisioned
- [ ] Stripe account configured (live keys, webhook endpoint)
- [ ] Cloudflare R2 bucket created
- [ ] Resend account configured
- [ ] Twilio account configured
- [ ] Domain DNS configured (app.clinicflow.com, portal.clinicflow.com)
- [ ] ACM TLS certificate issued
- [ ] AWS infrastructure provisioned via Pulumi (`pulumi up`)
- [ ] Environment variables set in ECS task definition / Vercel

## Cutover Steps

### 1. Database Migration (5 minutes)
```bash
# Set production env vars
export DATABASE_URL="postgresql://...neon.tech/clinicflow?sslmode=require"
export DIRECT_URL="postgresql://...neon.tech/clinicflow?sslmode=require"

# Swap to production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate client + push schema
bun run db:generate
bun run db:push

# Apply RLS policies
psql $DIRECT_URL -f prisma/sql/rls-policies.sql

# Seed initial data (plans, demo tenant)
bun prisma/seed.ts
```

### 2. Deploy Application (10 minutes)
```bash
# Build Docker image
docker build -t clinicflow:latest .

# Push to ECR
docker tag clinicflow:latest $ECR_URI:latest
docker push $ECR_URI:latest

# Deploy via Pulumi (creates new ECS task)
pulumi up

# Or deploy via Vercel:
vercel --prod
```

### 3. Configure External Services
```bash
# Set BILLING_ADAPTER=stripe
# Set LOCK_ADAPTER=redis
# Set REDIS_URL=rediss://...
# Set STRIPE_SECRET_KEY=sk_live_...
# Set STRIPE_WEBHOOK_SECRET=whsec_...

# Configure Stripe webhook endpoint:
#   URL: https://api.clinicflow.com/api/webhooks/stripe
#   Events: invoice.paid, customer.subscription.updated, customer.subscription.deleted
```

### 4. Verify (5 minutes)
```bash
# Health check
curl https://api.clinicflow.com/api/trpc/health.check
# Expected: {"result":{"data":{"json":{"ok":true,...}}}}

# Isolation tests (run against staging first)
bun run test:isolation

# Smoke test: login, view dashboard, create patient
```

### 5. Canary Rollout (45 minutes)
```
5% traffic → 15 min → verify error rate < 1%, p95 < 500ms
25% traffic → 15 min → verify
50% traffic → 15 min → verify
100% traffic → done
```

## Rollback Plan
```bash
# Roll back to previous ECS task
aws ecs update-service --cluster clinicflow --service clinicflow-service \
  --task-definition clinicflow:previous

# Or with Vercel:
vercel rollback
```

## Post-Cutover
- [ ] Monitor error rate + latency for 24 hours
- [ ] Verify Stripe webhooks are being received and processed
- [ ] Verify audit log is recording PHI access
- [ ] Run full test suite against production
- [ ] Sign BAAs with all subprocessors
- [ ] Configure Datadog dashboards + alerts
- [ ] Configure Sentry error tracking
- [ ] Set up on-call rotation
