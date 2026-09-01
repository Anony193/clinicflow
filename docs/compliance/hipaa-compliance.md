# ClinicFlow — HIPAA Compliance Documentation

## BAA (Business Associate Agreement) Checklist

| Subprocessor | Purpose | BAA Status |
|---|---|---|
| AWS / Neon | Database hosting | ☐ Required |
| Stripe | Payment processing | ☐ Required |
| Clerk | Authentication | ☐ Required |
| Cloudflare (R2) | Document storage | ☐ Required |
| Resend | Transactional email | ☐ Required |
| Twilio | SMS reminders | ☐ Required |
| Inngest | Durable execution | ☐ Required |
| Sentry | Error tracking | ☐ Required |

## PHI Encryption
- **At rest**: AES-256 (database + R2 server-side encryption)
- **In transit**: TLS 1.3 (ALB + ACM)
- **Field-level**: AES-256-GCM via `src/lib/encryption.ts`
- **Key rotation**: Every 90 days via AWS KMS

## PHI Access Logging
- Every access logged in `AuditEvent` with `phi=true`
- Append-only (database triggers prevent UPDATE/DELETE)
- Fields: actorId, entity, entityId, phi, createdAt, ip, userAgent

## Data Retention
- Audit logs: 7 years (2,555 days)
- Patient records: 7 years after archiving
- Backups: 7 days automated + 7-year archive

## Breach Notification (HITECH)
1. Detection → 2. Assessment → 3. Notification (60 days) → 4. Documentation (6 years)

## DSAR (Data Subject Access Request)
- Export: `POST /api/compliance/dsar { action: "export" }`
- Delete: `POST /api/compliance/dsar { action: "delete" }`
- Response window: 30 days (GDPR)

## Minimum Necessary Access (RBAC)
- Therapists: own patients only
- Front desk: scheduling + demographics (no clinical notes)
- Billing managers: financial data only
- Patients: own records only (via portal)
