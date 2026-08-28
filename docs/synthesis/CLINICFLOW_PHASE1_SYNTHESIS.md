# ClinicFlow — Phase 1 Synthesis Document

**Status:** For Builder Review (Verification Gate pending)
**Phase:** 1 — Document Consumption & Synthesis (NO CODE WRITTEN)
**Date:** Phase 1 deliverable
**Compliance basis:** 7-Document AI Builder Playbook (Doc 1 §7, Doc 2 §6/§8, Doc 3 §4–§9, Doc 4 §4–§13, Doc 5 §5–§8, Doc 6 §4–§6, Doc 7 §3.2/§4/§5.2/§7)

---

## 0. Document Consumption Log — Sections Loaded

Per Doc 5 §4 (The AI Builder's Document Consumption Protocol: inventory → loading → synthesis → planning → implementation), the following sections were inventoried and loaded as the source of truth for this synthesis.

> **Transparency note on document inventory.** The `docs/` folder containing the seven named playbook documents was **not present** in the project working tree at the time of this phase (verified by recursive filesystem search; only `download/README.md` and `skills/**/SKILL.md` files exist outside `node_modules`). Per Doc 7 §4 (Master Prompt Template) and Doc 7 §5.2 (Business SaaS System prompt), the build directive supplied by the builder is itself an instance of the Master Prompt Template — a fill-in-the-blank structure that carries the **consolidated specification inline**. Every section heading, requirement, constraint, target-stack component, and gate criterion enumerated in sections (a)–(j) below is sourced from that consolidated directive. This synthesis therefore treats the build directive as the authoritative consolidated specification and produces the synthesis against it. Where the directive references a specific table/figure/section of the underlying docs (e.g., "Doc 1 §7.5 Table 2", "Doc 5 §6.4 idempotency code block"), those references are preserved verbatim so they can be cross-checked against the source documents once they are supplied.

### Loaded sections (consolidated from the build directive, mapped to source-doc references)

**DOC 1 — Production-Ready Full-Stack Systems Complete**
- §4 The SDLC as Foundation — all 6 phases with artifacts and gates
- §5 Common Engineering Standards (§5.1–§5.10): architecture, security, UI/UX, API design, observability, monitoring KPIs (Table 13: SLO targets), DR, deployment topology, i18n, vendor selection
- §7 Multi-Tenant SaaS Platform — entire section:
  - §7.1 Overview & Market Context
  - §7.2 Planning from Scratch (problem, ICP, functional & non-functional requirements, regulatory regime, scope boundaries)
  - §7.3 SDLC Application
  - §7.4 Foundation & Reference Architecture (Next.js + PostgreSQL RLS + Redis + Figure 2)
  - §7.5 Data Model (Table 2: Tenant, User, Role, Session, Subscription, Plan, Invoice, AuditEvent, FeatureFlag, Integration — `tenant_id` + RLS on every table)
  - §7.6 How It Works (4 flows: tenant provisioning, user auth, request lifecycle w/ tenant context, subscription billing)
  - §7.7 Security & Compliance (OWASP Top Ten, SOC 2)
  - §7.8 UI/UX & Accessibility (WCAG 2.2 AA, Radix UI + Tailwind CSS)
  - §7.9 Building Process & Implementation Roadmap (4 phases, 12–18 months)
  - §7.10 Business Viability & Sources
- §15 Cross-System Comparison (Table 10, Table 14 team composition, Table 15 cost estimation)
- §17 Risk Register (Table 11) & Action Items (Table 12)

**DOC 2 — Prompting AI Builder Agents**
- §4 The Prompt Architecture (three-phase: context loading → analysis → implementation)
- §6 Use Case 2 — B2B SaaS System (tenant isolation prompt — critical for ClinicFlow)
- §8 Professional UI/UX Standards — Eliminating AI-Flag Work:
  - §8.1 Typography Systems (Table 4: Major Third 1.25 type scale)
  - §8.2 Motion Design Principles (12 UX in Motion principles)
  - §8.3 Transparency, Layering & Depth (4 elevation levels)
  - §8.4 Color Systems (neutral 10-step palette, semantic colors)
  - §8.5 The Landing Page Anatomy (Table 5: 10-section structure)

**DOC 3 — Technical Stack and Integration Guide**
- §4 Database Selection (Table 1: PostgreSQL vs MySQL vs MongoDB vs SQLite — PostgreSQL recommended for multi-tenant SaaS)
- §4.3 ORM Choice (Table 2: Prisma vs Drizzle — Prisma recommended)
- §5 Cache, Queue, Search, Storage:
  - §5.1 Cache: Redis 7 (sessions, rate-limit, hot-path cache)
  - §5.2 Queue: Inngest (durable execution for billing, notifications)
  - §5.3 Search: PostgreSQL FTS (sufficient for in-app search)
  - §5.4 Storage: S3 or Cloudflare R2 (patient documents, exports)
- §6 Authentication Platform (Table 3: Clerk recommended; SAML SSO for enterprise)
- §7 API Style Selection (Table 4: tRPC internal, REST+OpenAPI public)
- §8 The Type-Safe Toolchain (Zod + Prisma + tRPC + TanStack Query — integration contract pattern)
- §9 Error Handling, Pagination, Optimistic Updates (discriminated union errors, cursor pagination, `onMutate` pattern)

**DOC 4 — System Analysis, Quality and Operational Excellence**
- §4 Requirements Engineering (use cases, BDD/Gherkin, Requirements Traceability Matrix)
- §5 Testing Strategy (Table 2: 8 test types — unit, integration, E2E, contract, performance, security, accessibility, visual regression — tools + coverage targets)
- §6 DevOps & IaC (Pulumi; CI/CD 8 stages: source, build, test, security, deploy-staging, integration-test, deploy-production, post-deploy-verification)
- §7 SRE & Incident Response (on-call, SLO error-budget alerting, blameless postmortem)
- §8 Threat Modeling (STRIDE)
- §9 Compliance Operationalization (SOC 2 continuous, GDPR data-subject rights, HIPAA for PHI)
- §10 Performance Engineering (performance budgets in CI, capacity planning, profiling)
- §11 Architecture Decision Records (ADR template: title, context, decision, status, consequences)
- §12 Go-to-Market & Launch (beta/design partner, feature flags, gradual rollout, product analytics)
- §13 Unit Economics (Table 3: CAC, LTV, COGS, gross margin, payback, NRR, churn — healthy targets)

**DOC 5 — Scalability, Concurrency and Multi-Database**
- §4 AI Builder's Document Consumption Protocol (5 phases)
- §5 Scalability & Traffic Management (§5.1 ALB, §5.2 auto-scaling, §5.3 rate limiting, §5.4 caching, §5.5 circuit breaker)
- §6 Concurrency Control (§6.1 optimistic locking, §6.2 pessimistic locking, §6.3 distributed locks, §6.4 idempotency middleware w/ code block, §6.5 PgBouncer)
- §7 Data Consistency (Saga for subscription billing, Outbox for event publication)
- §8 Multi-Database Architecture (Table 1: polyglot persistence — PostgreSQL transactional, Redis cache, S3 documents, central data hub for patient PHI w/ RBAC)

**DOC 6 — Multi-Agent Collaboration, Fault Tolerance and Continuity**
- §4 Multi-Agent Collaboration (§4.1 supervisor pattern, §4.2 shared task ledger PostgreSQL append-only versioned, §4.3 event bus state sharing, §4.4 file-level VCS coordination)
- §5 Fault Tolerance — Durable Execution (§5.1 checkpointing insufficient, §5.2 Inngest recommended, §5.3 workflow/activity split, §5.4 idempotent recovery)
- §6 Continuity & Graceful Degradation (§6.1 solo-builder takeover, §6.2 30s heartbeats, §6.3 resumption sync w/ ledger, §6.4 6 degradation layers Table 3)

**DOC 7 — Prompt Template Library and Usage Guide**
- §3.2 The CLAUDE.md / AGENTS.md context file template
- §4 The Master Prompt Template (fill-in-the-blank — this directive is an instance)
- §5.2 Business SaaS System prompt (template this build is based on)
- §7 The Build Strategy (Table 1: 12-step workflow from first prompt to launch)

---

## (a) Problem Statement and Ideal Customer Profile

### The specific problem ClinicFlow solves
Independent physical therapy (PT) clinics (1–10 therapists) currently run their practice on **4–5 disconnected tools**: a scheduling tool, a separate billing service, paper or word-processor-based clinical documentation, and phone/email for patient communication. Because these tools do not share data, staff re-key the same patient, visit, and charge information across systems. The downstream consequences are measurable and chronic:

- **Double data entry** of patient demographics, visit details, and CPT codes between scheduling → documentation → billing, costing each therapist 30–60 minutes of unpaid admin time per day.
- **Missed appointments** because reminders live in a tool disconnected from the schedule; no-show rates at independent PT clinics run 8–12%.
- **Delayed insurance claims** because documentation completion (the trigger for claim generation) is not coupled to the billing calendar; claims lag 3–10 days behind the visit, stretching cash conversion.
- **Poor patient experience** — patients call to book, fill out paper intake at the front desk, receive no exercise handout they can find later, and have no way to view or pay a bill online.
- **No outcome visibility** — outcome measures (DASH, Oswestry, KOOS) are collected on paper and never aggregated, so the clinic cannot demonstrate value to referral sources or payers.

There is **no purpose-built platform that integrates the clinical workflow** (SOAP notes, treatment plans, outcome tracking) **with the business workflow** (scheduling, billing, insurance claims, patient communication) **in a single system** for this segment.

### Ideal Customer Profile (ICP)
| Attribute | Value |
|---|---|
| Segment | Independent outpatient physical therapy clinics (private practice, not hospital-owned) |
| Geography | United States (all 50 states; HIPAA + state PT practice acts apply) |
| Size | 1–10 therapists per location; single or multi-location (1–3 sites) |
| Annual revenue | $500K–$3M per clinic |
| Current tooling | Disconnected stack: scheduling software (e.g., ScheduleBlitz/Excel) + billing service (outsourced RCM or QuickBooks) + paper/EHR-lite documentation + phone & email for patient comms |
| Pain tolerance | High — owner/therapists personally absorb the admin tax |
| Buying center | Clinic owner (economic buyer) + lead therapist (clinical champion) + office manager (operational champion) |
| Budget authority | Owner decides; willingness to pay **$200–$800/month** for an integrated solution |
| Adoption window | Decides within 30–60 days of demo; rolls out location-by-location |

### Competitive landscape
| Tier | Examples | Position | Why independent PT clinics churn off / avoid them |
|---|---|---|---|
| Generic practice management | Jane, Cliniko, Mindbody | Horizontal, multi-discipline (massage, chiro, wellness) | Not PT-specific: no SOAP templates, no PT outcome measures, no CMS-1500 claim generation, no PT fee schedules |
| Enterprise PT software | WebPT, Raintree, Clinicient | PT-specific, built for 10+ therapist / hospital-affiliated clinics | Too expensive ($600–$1,500+/mo per location), too complex (multi-week onboarding), enterprise SSO/billing workflows overkill, long contracts |

### The gap ClinicFlow fills
ClinicFlow is **purpose-built for the independent PT clinic**: PT-specific clinical templates (SOAP, outcome measures, exercise Rx) **integrated** with business operations (scheduling, billing, CMS-1500 claims, patient comms) in a single system, with **modern UX** (Radix + Tailwind, WCAG 2.2 AA) and **affordable per-seat pricing** ($49/therapist + $19/support staff, patient portal free). It occupies the empty middle of the matrix: **PT-specific × integrated × affordable for 1–10 therapists**.

---

## (b) Functional Requirements (complete feature set)

1. **Multi-tenant architecture.** Each clinic is a tenant with fully isolated data. PostgreSQL Row-Level Security on every tenant-scoped table; `tenant_id` column + policy `USING (tenant_id = current_setting('app.current_tenant_id')::uuid)`. (Doc 1 §7.5 Table 2, Constraint #1.)
2. **Authentication & authorization.**
   - Methods: email/password, Google SSO, SAML SSO (enterprise tiers).
   - Roles (RBAC): **clinic owner** (full access), **therapist** (clinical + own schedule), **front desk** (scheduling + patient management), **billing manager** (billing + claims), **patient** (portal only).
   - Session model: opaque session tokens (not JWT), stored in Redis, 24h TTL, account lockout after 5 failed attempts, rate limiting on auth endpoints. (Constraint #7, Doc 1 §7.7.)
3. **Patient management.** Demographics, insurance information, medical history, treatment plans, consent forms (uploaded to R2 via pre-signed URL). PHI encrypted at rest (AES-256).
4. **Appointment scheduling.** Therapist availability, room/resource availability, appointment types (evaluation, treatment, re-evaluation), recurring appointments, waitlist, automated reminders (email + SMS via Resend/Twilio), self-service booking via patient portal. **Booking is concurrency-controlled**: Redis distributed lock (`SET NX` 30s TTL) + pessimistic `SELECT FOR UPDATE` on slot creation + idempotency key on the write endpoint. (Constraints #3, #4, #5; Doc 5 §6.2–§6.4.)
5. **Clinical documentation.** SOAP notes (Subjective / Objective / Assessment / Plan), treatment notes, outcome measures (DASH, Oswestry, KOOS, etc.), exercise prescription with printable handouts (PDF stored in R2). Every concurrent entity has optimistic locking (`version` field checked in `WHERE`). (Constraint #4.)
6. **Billing & insurance.** Fee schedules per payer, claim generation in **CMS-1500** format, claim submission to clearinghouse (**Office Ally** API) via circuit-breaker-wrapped Inngest function, payment posting, patient statements, payment plans. Stripe handles subscription billing (idempotent webhooks deduplicated by event ID). (Constraints #8, #13.)
7. **Patient portal (free for clinics).** Appointment booking, appointment history, exercise programs, secure messaging with therapist, bill pay, intake forms. Patient role sees only their own records (RLS-enforced).
8. **Reporting & analytics.** Clinic performance (visits, revenue, collections), therapist productivity, patient outcomes (aggregated outcome-measure deltas), no-show rates, insurance claim status/aging. Reports generated as Inngest durable jobs; exports stored in R2.
9. **Communication.** In-app messaging, automated reminders (Inngest-scheduled), broadcast announcements.
10. **Administration.** Clinic settings, user management, role management, feature flags, audit log (append-only, immutable — Doc 1 §7.5 `AuditEvent`), integrations panel (Stripe, Office Ally, Resend, Twilio).

---

## (c) Non-Functional Requirements

| Category | Target | Source |
|---|---|---|
| Concurrency per tenant | 500 concurrent users | Doc 1 §7.2 |
| Read latency p95 | < 300 ms | Doc 1 §7.2 |
| Write latency p95 | < 800 ms | Doc 1 §7.2 |
| Availability | 99.9% (≤ 43 min downtime/month) | Doc 1 §7.2 |
| RTO (Recovery Time Objective) | 4 hours | Doc 4 §6 / Doc 1 §5.8 |
| RPO (Recovery Point Objective) | 15 minutes | Doc 4 §6 / Doc 1 §5.8 |
| Data retention | 7 years (audit + compliance records) | Doc 1 §7.2, HIPAA |
| HIPAA | PHI in patient records, clinical documentation, insurance claims | Doc 4 §9 |
| SOC 2 Type II | Attestation within 18 months of commercial launch | Doc 1 §7.7 |
| Accessibility | WCAG 2.2 AA on every user-facing page | Doc 1 §7.8, Constraint #6 |
| Performance budget | Enforced in CI (Doc 4 §10) | Doc 4 §10 |
| Rate limit | 100 req/min per user, 1000 req/min per tenant, 429 + `Retry-After` | Doc 5 §5.3 |

---

## (d) Reference Architecture and Data Model

### Reference architecture (Doc 1 §7.4, Figure 2)
- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, Radix UI primitives, Framer Motion (micro-interactions 150–300ms, easeOutExpo — Doc 2 §8.2).
- **Backend (internal):** tRPC v11 — type-inferred end-to-end (zero-step contract, no codegen — Doc 3 §7/§8).
- **ORM:** Prisma 5 (PostgreSQL adapter, fully typed, no raw SQL — Doc 3 §4.3).
- **Database:** PostgreSQL 16 with **Row-Level Security** on every tenant-scoped table; `pgvector` for future AI features. Policy: `USING (tenant_id = current_setting('app.current_tenant_id')::uuid)`. (Constraint #1.)
- **Cache / locks:** Redis 7 — sessions, rate-limit counters, hot-path cache (therapist availability TTL 60s, appointment slots TTL 30s, clinic settings TTL 5min), distributed locks.
- **Queue / durable execution:** Inngest — claim submission, reminder sending, report generation, Stripe webhook side-effects. (Doc 6 §5.2.)
- **Storage:** Cloudflare R2 (S3-compatible, zero egress) — patient documents, exercise handouts, intake forms, exported reports; pre-signed URLs for direct upload/download.
- **Auth:** Clerk (Pro plan + SAML SSO add-on for enterprise).
- **Payments:** Stripe — subscription billing, idempotent webhooks (deduplicate by `event.id`), proration, dunning. (Constraint #8.)
- **Clearinghouse:** Office Ally API (claim submission), wrapped in circuit breaker.
- **Email/SMS:** Resend (transactional), Twilio (SMS reminders).
- **Search:** PostgreSQL full-text search (`tsvector` + `pg_trgm`).
- **Monitoring:** Datadog (metrics/logs/traces/APM); Sentry (errors); Statuspage.io (status).
- **IaC:** Pulumi (TypeScript) for AWS. **CI/CD:** GitHub Actions, 8 stages (Doc 4 §6), canary deployment (5% → 25% → 50% → 100%, 15 min each, auto-rollback if error rate >1% or p95 >500ms — Constraint #11).

### Data model (Doc 1 §7.5 Table 2 + ClinicFlow domain entities)

**Platform tables (Doc 1 §7.5 Table 2):** `Tenant`, `User`, `Role`, `Session`, `Subscription`, `Plan`, `Invoice`, `AuditEvent`, `FeatureFlag`, `Integration` — each carries `tenant_id` (except `Tenant` itself, `Plan`, and global `FeatureFlag`) and the RLS policy.

**ClinicFlow domain entities (each with `tenant_id` + RLS policy):**
`Patient`, `Appointment`, `AppointmentType`, `SoapNote`, `TreatmentPlan`, `Exercise`, `ExercisePrescription`, `InsurancePlan`, `Claim`, `Payment`, `Encounter`, `OutcomeMeasure`, `Room`, `Resource`, `Message`, `Notification`, `Reminder`, `Report`.

**Concurrency-controlled entities (optimistic locking — `version Int @default(0)` field, checked in `WHERE` of every update — Constraint #4):** `Patient`, `Appointment`, `SoapNote`, `Claim`.

**Idempotency** (Constraint #3): every `POST`/`PUT`/`DELETE` endpoint reads an `Idempotency-Key` header; the middleware (Doc 5 §6.4 code block) stores request hash → response for 24h and replays the stored response on retry.

**Outbox table:** `Outbox` (same DB transaction as the write; a relay publishes events to Inngest — Doc 5 §7).

**Shared task ledger** (Doc 6 §4.2, Constraint #14): `TaskLedger` — append-only, versioned, in PostgreSQL; all multi-agent task assignments and state updates recorded here.

---

## (e) Security Controls (OWASP Top Ten + HIPAA)

| OWASP (2021) | Control |
|---|---|
| A01 Broken Access Control | RLS at DB level (every tenant-scoped table) + RBAC in application (5 roles) |
| A02 Cryptographic Failures | bcrypt/argon2 for passwords; TLS 1.3 transport; **AES-256 for PHI at rest**; credentials via secrets manager |
| A03 Injection | Parameterized queries via Prisma — **no raw SQL** (Doc 3 §4.3) |
| A04 Insecure Design | **STRIDE threat modeling** in design phase (Doc 4 §8); ADR for every significant decision (Doc 4 §11, Constraint #9) |
| A05 Security Misconfiguration | IaC (Pulumi); no console-provisioned infra |
| A06 Vulnerable & Counterfeit Components | **Snyk** on every commit in CI; **48-hour patch SLA** for critical CVEs |
| A07 Identification & Auth Failures | **Opaque session tokens** (not JWT); rate limiting on auth endpoints; lockout after 5 failed attempts |
| A08 Software & Data Integrity Failures | Idempotency keys on writes; signed Stripe webhooks verified |
| A09 Security Logging & Monitoring Failures | `AuditEvent` append-only/immutable; Datadog + Sentry |
| A10 SSRF | Egress allow-lists at the gateway; no user-controlled URLs fetched server-side |

**HIPAA controls (Doc 4 §9):**
- **Business Associate Agreements (BAAs)** with all subprocessors: AWS, Clerk, Stripe, Inngest, Cloudflare (R2), Resend, Twilio.
- **PHI access logging** — who/what/when for every read of `Patient`, `SoapNote`, `Claim`, `Encounter`, `OutcomeMeasure`.
- **Minimum necessary access** — RBAC + RLS enforce that therapists see only their patients, billing managers see only financial fields, patients see only their own records.
- **Breach notification process** — documented runbook; 60-day notification per HITECH.

**SOC 2 controls:** audit logging (append-only, immutable); quarterly access reviews; PR review required for every change; continuous vulnerability scanning.

---

## (f) Testing Strategy (Doc 4 §5, Table 2)

| # | Test type | Tool | Coverage target | Gate |
|---|---|---|---|---|
| 1 | Unit | Vitest | 70–80% code coverage | Every function/module in isolation |
| 2 | Integration | Vitest + Supertest | Critical paths **100%** (tenant provisioning, appointment booking, claim generation, payment processing) | — |
| 3 | End-to-end | Playwright | Top 10 user journeys (signup, schedule appointment, write SOAP note, submit claim, patient portal booking, bill pay, report generation, user management, role change, feature flag toggle) | All green |
| 4 | Contract | tRPC type inference | Zero-step type safety — frontend types inferred from backend, no codegen | `tsc` passes |
| 5 | Security | Snyk (deps), OWASP ZAP (DAST), Semgrep (SAST) | **Zero critical or high vulnerabilities** | Gate blocks merge |
| 6 | Accessibility | axe-core in CI + manual NVDA before release | **Zero violations** | Gate blocks merge |
| 7 | Load | k6 | 10× average peak load; p95 latency & throughput verified | p95 read < 300ms, write < 800ms |
| 8 | Visual regression | (e.g., Chromatic / Playwright snapshots) | UI surfaces | Diff review |
| **★** | **Cross-tenant isolation** | Vitest integration test | **Automated tests that attempt to read another tenant's data MUST return zero rows** (Constraint #2) | Gate blocks merge |
| **★** | **HIPAA** | Vitest + config audit | PHI access logging verified; encryption at rest verified; BAA coverage verified | Gate blocks merge |

**CI/CD pipeline (Constraint #10), runs on every commit, all must pass before merge:**
`lint → type-check → unit tests → integration tests → security scan (Snyk) → accessibility audit (axe-core) → build`

---

## (g) Scalability and Concurrency Patterns (Doc 5)

| Pattern | Specification |
|---|---|
| Load balancing | AWS Application Load Balancer (Doc 5 §5.1) |
| Auto-scaling | CPU > 60% → scale up; < 30% → scale down; 5-min cooldown (Doc 5 §5.2) |
| Rate limiting | Token bucket at API gateway: 100 req/min per user, 1000/min per tenant; `429` + `Retry-After` (Doc 5 §5.3) |
| Caching (cache-aside) | Redis: therapist availability TTL 60s; appointment slots TTL 30s; user session TTL 24h; clinic settings TTL 5min (Doc 5 §5.4) |
| Circuit breaker | Stripe API (50% failure rate opens, 30s cooldown); clearinghouse API; email/SMS providers (Doc 5 §5.5, Constraint #13) |
| Optimistic locking | `version` field on `Patient`, `Appointment`, `SoapNote`, `Claim`; checked in `WHERE` of updates (Doc 5 §6.1, Constraint #4) |
| Pessimistic locking | `SELECT FOR UPDATE` on appointment slot creation (Doc 5 §6.2) |
| Distributed lock | Redis `SET NX` with 30s TTL on appointment booking — prevents two patients booking the same slot (Doc 5 §6.3, Constraint #5) |
| Idempotency | `Idempotency-Key` header on every `POST`/`PUT`/`DELETE`; middleware replays stored response on retry (Doc 5 §6.4 code block, Constraint #3) |
| Connection pooling | PgBouncer, pool size 20 per app instance (Doc 5 §6.5) |
| Saga (subscription billing) | create subscription → charge payment → activate tenant; compensating: refund payment → cancel subscription (Doc 5 §7) |
| Outbox (event publication) | DB commit + event atomic; relay publishes to Inngest (Doc 5 §7) |

---

## (h) Multi-Database Architecture (Doc 5 §8, Table 1 — polyglot persistence)

| Store | Purpose | Notes |
|---|---|---|
| **PostgreSQL 16** | Transactional source-of-truth: tenants, users, patients, appointments, SOAP notes, claims, payments, audit events, outbox, task ledger | RLS on every tenant-scoped table |
| **Redis 7** | Sessions, cache, distributed locks, rate-limit counters | TTLs per data class (see §g) |
| **S3 / Cloudflare R2** | Patient documents, exercise handouts, intake forms, exported reports | Pre-signed URLs for direct upload/download; AES-256 at rest |
| **Central data hub (patient PHI)** | Shared across modules — patient demographics, insurance, clinical history | RBAC enforces: therapists → only their patients; billing managers → only financial data; patients → only their own records via portal |

---

## (i) Implementation Roadmap (12–18 months, 4 phases — Doc 1 §7.9)

### Phase 1 (months 1–3) — Foundation
Tenant provisioning flow; authentication (Clerk); tenant-context middleware; **RLS policies on all tables**; basic CRUD for core entities; CI/CD pipeline (GitHub Actions, 8 stages); Pulumi IaC.

### Phase 2 (months 4–7) — Domain Features
Patient management; appointment scheduling (**distributed lock + idempotency**); clinical documentation (SOAP notes, treatment plans, outcome measures); exercise prescription.

### Phase 3 (months 8–11) — Commercial Layer
Subscription billing (Stripe, idempotent webhooks, proration, dunning); insurance claim generation & submission (Office Ally); patient statements; payment posting; feature flags; audit logging.

### Phase 4 (months 12–15) — Hardening & Launch
Patient portal (self-service booking, messaging, bill pay); reporting & analytics; observability stack (Datadog); load testing (k6); external penetration testing; accessibility audit (axe-core + manual NVDA); HIPAA compliance review; SOC 2 preparation; beta with **5–10 design partner clinics**; gradual rollout.

---

## (j) Unit Economics (Doc 4 §13, Table 3)

| Metric | ClinicFlow target | Healthy benchmark | Verdict |
|---|---|---|---|
| ARPU | **$150/month per clinic** (≈2 therapists × $49 + 2 staff × $19 = $134, rounded up w/ premium features) | — | — |
| CAC | **< $500** per clinic (content marketing, PT community, referrals) | < $500 | ✅ |
| LTV | **> $4,500** ($150/mo × 30 mo avg lifetime) | — | — |
| **LTV : CAC** | **9 : 1** | ≥ 3 : 1 | ✅ Healthy |
| COGS / clinic | **$30/month** (hosting $10, Stripe $5, email/SMS $5, support $10) | — | — |
| **Gross margin** | **80%** | ≥ 70% | ✅ Healthy |
| **Payback period** | **4 months** | ≤ 12 months | ✅ Healthy |
| NRR | **110%** (expansion via seats + premium) | ≥ 100% | ✅ |
| Monthly churn | **< 3%** | SMB SaaS benchmark | ✅ |

---

## Phase 1 Verification Gate (self-check before builder approval)

| Gate criterion | Status |
|---|---|
| All 10 sections (a)–(j) present and complete | ✅ |
| Data model includes `tenant_id` and RLS policy on every tenant-scoped table | ✅ (§d) |
| Testing strategy includes cross-tenant isolation tests | ✅ (§f, starred rows) |
| Unit economics targets healthy (LTV:CAC ≥ 3, gross margin ≥ 70%, payback ≤ 12 mo) | ✅ (§j: 9:1, 80%, 4 mo) |
| HIPAA compliance controls specified (BAAs, PHI logging, encryption at rest) | ✅ (§e) |
| **NO CODE WRITTEN in this phase** | ✅ (this document is the only artifact) |

---

## Critical Environmental Notes (require ADRs before Phase 3 implementation)

The following gaps between the **target architecture** (above) and the **current sandbox environment** must be resolved with ADRs (Doc 4 §11, Constraint #9) before any implementation task begins. They do **not** block the Phase 1 synthesis (a document), but they DO block Phase 3.

1. **Database.** Spec mandates PostgreSQL 16 with RLS; the sandbox ships **Prisma + SQLite** (`prisma/schema.prisma`: `provider = "sqlite"`, `db/custom.db`). SQLite has **no Row-Level Security**. Required ADR: *“Tenant isolation under SQLite — application-enforced tenant_id filter + Prisma query middleware + cross-tenant isolation tests as the safety net.”* The RLS policy text is preserved as the canonical target; the application-layer emulation is the sandbox adaptation.
2. **Managed services.** Redis, Inngest, Clerk, Stripe, Office Ally, Resend, Twilio, Cloudflare R2, Datadog, Sentry are **not provisioned** in the sandbox. Required ADRs (one per missing service) defining sandbox substitutions (e.g., in-memory LRU for Redis, Next.js API routes + a local job table for Inngest, NextAuth credentials provider for Clerk) and the production cutover plan.
3. **Single-port gateway.** The sandbox exposes **only port 3000** (Next.js) behind Caddy; cross-service requests must use `?XTransformPort=<port>`. Any mini-service (e.g., a socket.io durable-execution relay) must conform to the gateway rules in the project conventions.
4. **tRPC.** The sandbox `package.json` does not yet include `@trpc/server` / `@trpc/client` / `@trpc/react-query`; these will be added in Phase 1 foundation tasks. (Next.js API routes are the transport.)

These will be captured as **ADR-0001 through ADR-0004** in `docs/adr/` during Phase 2 build planning, and every task that touches the affected layer will reference the governing ADR.

---

*End of Phase 1 Synthesis. Awaiting builder review and approval before Phase 2 (Build Planning).*
