# ClinicFlow — Phase 2 Build Plan (Atomic Task Decomposition)

**Status:** For Builder Review
**Phase:** 2 — Build Planning (NO IMPLEMENTATION CODE YET)
**Predecessor:** `docs/synthesis/CLINICFLOW_PHASE1_SYNTHESIS.md` (approved)
**Compliance basis:** Doc 1 §7.9 (4-phase roadmap), Doc 4 §11 (ADR), Doc 5 §6 (concurrency), Doc 6 §4.2 (shared task ledger), Doc 7 §7 Table 1 (12-step build strategy)
**Constraint mapping:** Every task cites the constraint(s) it satisfies from the 14 non-negotiable constraints.

---

## 0. Governing ADRs (must be approved before Phase 3 implementation)

These 4 ADRs resolve the environment-vs-spec gaps flagged in the Phase 1 synthesis. Every foundation task references the governing ADR.

### ADR-0001 — Tenant isolation under SQLite (no PostgreSQL RLS in sandbox)
- **Context:** Spec mandates PostgreSQL 16 RLS (`USING (tenant_id = current_setting('app.current_tenant_id')::uuid)`). Sandbox ships Prisma + SQLite, which has no RLS.
- **Decision:** Implement **application-enforced tenant isolation**: (1) every tenant-scoped model has `tenant_id String`; (2) a Prisma `extension` / query middleware injects `tenant_id` into every `findMany`/`update`/`delete` `where` clause from the request's tenant context; (3) `create`/`update` data always includes `tenant_id` from context (never from client); (4) **cross-tenant isolation tests** (Constraint #2) are the safety net — automated tests that set tenant A context and attempt to read tenant B rows MUST return zero rows.
- **Status:** Proposed (awaiting builder approval).
- **Consequences:** RLS policy text preserved as canonical production target. Production cutover = add RLS policies + drop app middleware (no app behavior change). Isolation strength = application-layer (not DB-layer), mitigated by exhaustive isolation tests + single-tenant-per-query discipline.

### ADR-0002 — Managed-service substitutions for sandbox
- **Context:** Redis, Inngest, Clerk, Stripe, Office Ally, Cloudflare R2, Resend, Twilio, Datadog, Sentry are not provisioned in the sandbox.
- **Decision:** Define a `ports/` abstraction layer with a sandbox adapter and a production adapter for each: Redis→in-memory LRU + DB-backed locks; Inngest→local job table + polling worker (`mini-services/job-runner`); Clerk→NextAuth credentials provider; Stripe→Stripe test mode + mock webhook; Office Ally→stub with circuit breaker; R2→local `/upload` dir with pre-signed-URL-style handlers; Resend/Twilio→console+DB log; Datadog→structured JSON logs + `/api/metrics`; Sentry→console.
- **Status:** Proposed.
- **Consequences:** Every external dependency behind an interface (Dependency Inversion). Production cutover = swap adapter in `lib/ports/*.ts` via env var. No business logic changes.

### ADR-0003 — Single-port gateway conformance
- **Context:** Sandbox exposes only port 3000 behind Caddy; cross-service requests must use `?XTransformPort=<port>`.
- **Decision:** All mini-services (job-runner, socket.io relay if needed) use relative paths + `XTransformPort` query param. No absolute URLs in any `fetch`/`io()` call.
- **Status:** Proposed.
- **Consequences:** Mini-services run on fixed ports (3003, 3004…) documented in `mini-services/*/package.json`.

### ADR-0004 — tRPC adoption
- **Context:** `package.json` does not yet include `@trpc/server`, `@trpc/client`, `@trpc/react-query`.
- **Decision:** Install tRPC v11 in TASK-001. Use Next.js App Router API route (`/api/trpc/[trpc]/route.ts`) as transport. Frontend types inferred from backend (zero-step contract, Doc 3 §8).
- **Status:** Proposed.
- **Consequences:** All internal API calls go through tRPC procedures. Public/Stripe webhook endpoints stay as REST routes.

---

## 1. Task Decomposition — Conventions

Each task uses this shape:
```
TASK-###  Title  [Roadmap phase] [Governing ADR] [Constraint(s) satisfied]
  Input:        what must exist before this task starts
  Output:       the artifact(s) this task produces
  Acceptance:   how we know it's done correctly
  Gate:         the specific check to run (test / lint / type-check / a11y / build)
```

**Gate matrix (applies to every task, per Constraint #10):**
`bun run lint` · `tsc --noEmit` (type-check) · `bun run test` (unit/integration where applicable) · `axe-core` a11y (frontend tasks) · `bun run build` (production build must succeed).

---

## 2. Phase 0 — Pre-Foundation (ADRs + toolchain bootstrap)

### TASK-000  Author ADR-0001 through ADR-0004  [Phase 1] [—] [Constraint #9]
- **Input:** Approved Phase 1 synthesis.
- **Output:** `docs/adr/0001-tenant-isolation-sqlite.md`, `0002-managed-service-substitutions.md`, `0003-single-port-gateway.md`, `0004-trpc-adoption.md` — each with title/context/decision/status/consequences (Doc 4 §11 template).
- **Acceptance:** All 4 ADRs present, each follows the 5-field template, each references the constraint(s) it governs.
- **Gate:** Manual review by builder. No code.

### TASK-001  Install type-safe toolchain packages  [Phase 1] [ADR-0004] [—]
- **Input:** ADR-0004 approved.
- **Output:** `package.json` updated with `@trpc/server@^11`, `@trpc/client@^11`, `@trpc/react-query@^11`, `@trpc/next@^11`, `superjson` (for Date/BigInt serialization), `@tanstack/react-query@^5` (already present), `argon2` (password hashing), `nanoid` (idempotency keys). `bun install` succeeds.
- **Acceptance:** `bun install` clean; `import { initTRPC } from '@trpc/server'` resolves.
- **Gate:** `bun install` + `tsc --noEmit`.

### TASK-002  Multi-tenant Prisma schema — platform tables  [Phase 1] [ADR-0001] [Constraint #1]
- **Input:** ADR-0001.
- **Output:** `prisma/schema.prisma` with platform models (Doc 1 §7.5 Table 2): `Tenant`, `User`, `Role`, `Session`, `Subscription`, `Plan`, `Invoice`, `AuditEvent`, `FeatureFlag`, `Integration`, `Outbox`, `TaskLedger`, `IdempotencyRecord`. Every tenant-scoped model has `tenantId String` + `@@index([tenantId])`. Concurrent entities have `version Int @default(0)`.
- **Acceptance:** `bun run db:push` succeeds; `db.custom.db` has all tables; every tenant-scoped table has `tenant_id` column.
- **Gate:** `bun run db:push` + `bun run db:generate` + `tsc --noEmit`.

### TASK-003  Multi-tenant Prisma schema — ClinicFlow domain entities  [Phase 1] [ADR-0001] [Constraints #1, #4]
- **Input:** TASK-002.
- **Output:** Domain models added to `schema.prisma`: `Patient`, `Appointment`, `AppointmentType`, `SoapNote`, `TreatmentPlan`, `Exercise`, `ExercisePrescription`, `InsurancePlan`, `Claim`, `Payment`, `Encounter`, `OutcomeMeasure`, `Room`, `Resource`, `Message`, `Notification`, `Reminder`, `Report`. Each has `tenantId String` + `@@index([tenantId])`. `Patient`, `Appointment`, `SoapNote`, `Claim` have `version Int @default(0)` (optimistic locking, Constraint #4).
- **Acceptance:** `db:push` succeeds; all domain tables present with `tenant_id` + `version` (where required).
- **Gate:** `bun run db:push` + `bun run db:generate` + `tsc --noEmit`.

### TASK-004  Seed script — plans, roles, demo tenant  [Phase 1] [ADR-0001] [—]
- **Input:** TASK-003.
- **Output:** `prisma/seed.ts` seeding: 2 `Plan`s (Therapist $49, Support $19), 5 `Role`s (owner/therapist/front-desk/billing/patient), 1 demo `Tenant` ("Riverside PT") with 1 owner + 1 therapist + 2 patients. `package.json` `"prisma": {"seed": "bun prisma/seed.ts"}`.
- **Acceptance:** `bun run db:push` then seed runs; demo data queryable.
- **Gate:** `bun prisma/seed.ts` + manual `sqlite3 db/custom.db` row count check.

---

## 3. Phase 1 Roadmap — Foundation (months 1–3)

### TASK-005  Tenant-context Prisma extension (app-layer RLS)  [Phase 1] [ADR-0001] [Constraints #1, #2]
- **Input:** TASK-003.
- **Output:** `src/lib/db/tenant-extension.ts` — a Prisma client extension that reads `tenantId` from `AsyncLocalStorage` (set per-request by middleware) and (a) injects `tenantId` into every `findMany`/`findFirst`/`update`/`delete`/`count` `where`, (b) injects `tenantId` into every `create`/`createMany` `data`. Raises if no tenant context on a tenant-scoped model. `src/lib/db.ts` updated to apply the extension.
- **Acceptance:** A query with tenant-A context cannot return tenant-B rows even if the `where` omits `tenantId`.
- **Gate:** `bun run test -- src/lib/db/__tests__/tenant-isolation.test.ts` (cross-tenant read returns 0 rows — Constraint #2).

### TASK-006  Tenant context middleware (AsyncLocalStorage)  [Phase 1] [ADR-0001] [Constraint #1]
- **Input:** TASK-005.
- **Output:** `src/lib/context/tenant-context.ts` (`runInTenantContext(tenantId, fn)` using `AsyncLocalStorage`) + Next.js middleware `src/middleware.ts` that resolves `tenantId` from session cookie and runs the handler inside the context.
- **Acceptance:** `AsyncLocalStorage` propagates `tenantId` across async hops; tRPC context reads it.
- **Gate:** `bun run test -- context` + `tsc --noEmit`.

### TASK-007  tRPC scaffold + context  [Phase 1] [ADR-0004] [Constraints #3, #10]
- **Input:** TASK-001, TASK-006.
- **Output:** `src/server/trpc.ts` (`initTRPC.create()` + `superjson` transformer), `src/server/routers/_app.ts` (root router), `src/server/context.ts` (creates context from request: user, tenantId, role), `src/app/api/trpc/[trpc]/route.ts` (Next.js App Router fetch handler), `src/lib/trpc/client.ts` (client createTRPCReact), `src/lib/trpc/server.ts` (server-side caller).
- **Acceptance:** A trivial `health` procedure returns `{ ok: true }` from a server component and a client component.
- **Gate:** `tsc --noEmit` + `bun run build` + manual `/api/trpc/health` check.

### TASK-008  Idempotency middleware  [Phase 1] [ADR-0002] [Constraint #3]
- **Input:** TASK-002, TASK-007.
- **Output:** `src/server/middleware/idempotency.ts` — tRPC middleware that reads `Idempotency-Key` header, checks `IdempotencyRecord` table (key hash + tenantId + procedure path), replays stored response if found, else runs procedure and stores `{keyHash, tenantId, path, requestHash, response, expiresAt}`. 24h TTL. The pattern from Doc 5 §6.4 code block.
- **Acceptance:** Calling the same mutation twice with the same key produces one DB write and two identical responses.
- **Gate:** `bun run test -- idempotency.test.ts` (duplicate-create returns same id).

### TASK-009  Optimistic-locking helper  [Phase 1] [—] [Constraint #4]
- **Input:** TASK-003.
- **Output:** `src/server/lib/optimistic-lock.ts` — `withOptimisticLock(model, id, expectedVersion, patch)` that runs `update({ where: { id, version: expectedVersion, tenantId }, data: { ...patch, version: { increment: 1 } } })` and throws `OptimisticLockError` if 0 rows updated. Wired into Patient/Appointment/SoapNote/Claim update procedures.
- **Acceptance:** Two concurrent updates to the same Patient — second returns `OptimisticLockError` (HTTP 409).
- **Gate:** `bun run test -- optimistic-lock.test.ts`.

### TASK-010  Distributed-lock abstraction  [Phase 1] [ADR-0002] [Constraint #5]
- **Input:** TASK-002.
- **Output:** `src/lib/ports/lock.ts` interface `DistributedLock { acquire(key, ttlMs): Promise<LockHandle | null>; release(handle): Promise<void> }` + `src/lib/ports/lock.sqlite.ts` (SQLite adapter using a `Lock` table with unique `key` + `expiresAt`, `INSERT OR NOTHING`) + `src/lib/ports/lock.redis.ts` (stub for production, `SET NX PX`).
- **Acceptance:** Two concurrent `acquire("appt:slot:123", 30000)` calls — exactly one returns a handle, the other `null`.
- **Gate:** `bun run test -- lock.test.ts`.

### TASK-011  Circuit-breaker abstraction  [Phase 1] [ADR-0002] [Constraint #13]
- **Input:** —
- **Output:** `src/lib/ports/circuit-breaker.ts` — `CircuitBreaker` class with states CLOSED/OPEN/HALF_OPEN, config `{failureThreshold, failureRate, cooldownMs}`, `async run(fn)` that short-circuits to a fallback when OPEN. Wrap Stripe, Office Ally, Resend, Twilio calls.
- **Acceptance:** Injecting 50% failures opens the circuit after threshold; subsequent calls return fallback without invoking `fn`; after cooldown one trial call (HALF_OPEN).
- **Gate:** `bun run test -- circuit-breaker.test.ts`.

### TASK-012  Outbox + local job runner (Inngest substitute)  [Phase 1] [ADR-0002, ADR-0003] [Constraint #14]
- **Input:** TASK-002.
- **Output:** `src/lib/outbox.ts` (`writeOutbox(tx, event)` — called inside the same Prisma `$transaction` as the write), `mini-services/job-runner/` (independent bun project on port 3003, polls `Outbox` table every 2s, dispatches to registered handlers, marks processed). Gateway-compliant (no absolute URLs).
- **Acceptance:** A mutation that writes a row + an outbox event: the job-runner processes the event within 5s; on handler failure the event is retried with backoff, never lost.
- **Gate:** `bun run test -- outbox.test.ts` + start `mini-services/job-runner` and confirm processing.

### TASK-013  Auth — NextAuth credentials provider + roles  [Phase 1] [ADR-0002] [—]
- **Input:** TASK-002, TASK-004.
- **Output:** `src/lib/auth.ts` (NextAuth v4 config, credentials provider, argon2 verify, JWT session with `userId`/`tenantId`/`role`), `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/rbac.ts` (permission map per role), `src/app/(auth)/login/page.tsx` + `src/app/(auth)/signup/page.tsx`.
- **Acceptance:** Login with demo owner; session cookie set; `useSession()` returns role; protected routes redirect to `/login` when unauthenticated.
- **Gate:** `bun run test -- auth.test.ts` + `bun run build` + axe-core on login page (0 violations).

### TASK-010a  Rate limiter  [Phase 1] [ADR-0002] [Constraint #7 (partial), Doc 5 §5.3]
- **Input:** TASK-007.
- **Output:** `src/server/middleware/rate-limit.ts` — token-bucket per user (100/min) and per tenant (1000/min) using the lock-ports pattern (in-memory for sandbox). Returns tRPC `TOO_MANY_REQUESTS` error with `Retry-After`.
- **Acceptance:** 101st request in a minute from one user returns 429 + `Retry-After`.
- **Gate:** `bun run test -- rate-limit.test.ts`.

### TASK-014  Audit logging  [Phase 1] [—] [Constraint #12 (PHI logging), Doc 1 §7.5]
- **Input:** TASK-002, TASK-007.
- **Output:** `src/server/lib/audit.ts` — `logAudit({ actorId, tenantId, action, entity, entityId, phi: boolean, metadata })` appends to `AuditEvent` (append-only; no update/delete exposed). tRPC `loggedProcedure` middleware that wraps mutations and auto-logs. PHI-flagged entities (`Patient`, `SoapNote`, `Claim`, `Encounter`, `OutcomeMeasure`) set `phi=true`.
- **Acceptance:** Every mutation creates an `AuditEvent` row; PHI reads create a `phi=true` event; `AuditEvent` has no `update`/`delete` in any Prisma call site (enforced by eslint rule).
- **Gate:** `bun run test -- audit.test.ts` + `bun run lint`.

### TASK-015  Feature flags  [Phase 1] [—] [Doc 4 §12]
- **Input:** TASK-002.
- **Output:** `FeatureFlag` model usage in `src/lib/feature-flags.ts` (`isEnabled(tenantId, flagKey)` with 5-min in-memory cache). Flags: `patient_portal`, `stripe_billing`, `claims_submission`, `outcome_measures`, `exercise_library`.
- **Acceptance:** Toggling a flag in DB reflects within 5 min; disabled flag short-circuits the gated procedure.
- **Gate:** `bun run test -- feature-flags.test.ts`.

### TASK-016  Landing page (public `/`)  [Phase 1] [—] [Constraints #6, #7]
- **Input:** —
- **Output:** `src/app/page.tsx` — the 10-section landing-page anatomy (Doc 2 §8.5 Table 5): nav, hero, social proof, problem, solution, features, how-it-works, pricing ($49/$19, portal free), FAQ, CTA, footer. Major Third type scale (1.25), neutral 10-step palette, 4 elevation levels, Framer Motion (150–300ms, easeOutExpo). Sticky footer. This is the **only** user-visible route per sandbox rules.
- **Acceptance:** Page renders on `/`; Lighthouse a11y ≥ 95; axe-core 0 violations; responsive mobile→desktop; footer sticks to bottom on short content and pushes down on long content.
- **Gate:** `bun run build` + axe-core + Agent Browser visual check on `/`.

### TASK-017  App shell (authenticated layout)  [Phase 1] [—] [Constraints #6, #7]
- **Input:** TASK-013.
- **Output:** `src/app/(app)/layout.tsx` — sidebar (Patients, Schedule, SOAP Notes, Billing, Claims, Reports, Settings), topbar (tenant name, user menu, role badge), main content area, sticky footer. Collapsible sidebar on mobile. Role-based nav visibility.
- **Acceptance:** Each role sees only permitted nav items; keyboard-navigable; axe-core 0 violations; sticky footer verified.
- **Gate:** `bun run build` + axe-core + Agent Browser.

### TASK-018  CI/CD pipeline definition  [Phase 1] [—] [Constraint #10]
- **Input:** —
- **Output:** `.github/workflows/ci.yml` — 8 stages (source, build, test, security, deploy-staging, integration-test, deploy-production, post-deploy-verification) per Doc 4 §6. In sandbox: a `scripts/gate.sh` that runs `lint → type-check → test → build` (the gates that don't need external services). Canary deployment documented in `.github/workflows/deploy.yml` (5%→25%→50%→100%, 15min each, auto-rollback if error>1% or p95>500ms — Constraint #11).
- **Acceptance:** `bash scripts/gate.sh` exits 0 on clean tree; fails on introduced lint/type error.
- **Gate:** `bash scripts/gate.sh`.

---

## 4. Phase 2 Roadmap — Domain Features (months 4–7)

### TASK-019  Patient management  [Phase 2] [ADR-0001] [Constraints #1, #3, #4, #12]
- **Input:** TASK-005, TASK-008, TASK-009, TASK-014.
- **Output:** tRPC router `patients` (`list` cursor-paginated, `get`, `create` idempotent, `update` optimistic-locked, `archive`). `Patient` fields: demographics, insurance (`InsurancePlan` link), medical history (JSON), consent form URL (R2/local upload). Pages: `src/app/(app)/patients/page.tsx` (list+search), `.../[id]/page.tsx` (detail w/ tabs). PHI access logged.
- **Acceptance:** Create patient → appears in list; concurrent edit of same patient → 2nd gets 409; tenant-B cannot see tenant-A's patient (isolation test); every read logs an AuditEvent with `phi=true`.
- **Gate:** `bun run test -- patients.test.ts` (incl. cross-tenant) + axe-core on pages + `bun run build`.

### TASK-020  Appointment types + scheduling primitives  [Phase 2] [—] [Constraint #1]
- **Input:** TASK-019.
- **Output:** `AppointmentType` (eval 60min, treat 45min, re-eval 30min), `Room`, `Resource`, therapist availability (`Availability` model: therapist × weekday × start/end). tRPC routers `appointmentTypes`, `rooms`, `availability`. Pages under `.../schedule/`.
- **Acceptance:** Can configure a therapist's weekly availability; available slots computed correctly given appointment type + room + therapist.
- **Gate:** `bun run test -- schedule-primitives.test.ts` + `bun run build`.

### TASK-021  Appointment booking (critical concurrency task)  [Phase 2] [ADR-0002] [Constraints #3, #4, #5, #10]
- **Input:** TASK-010 (lock), TASK-008 (idempotency), TASK-009 (optimistic lock), TASK-020.
- **Output:** tRPC `appointments.book` — flow: (1) acquire distributed lock `appt:slot:{therapistId}:{start}` 30s TTL; (2) `SELECT FOR UPDATE`-equivalent (SQLite: transaction + existence check) on the slot; (3) create `Appointment` with `version=0` + idempotency key; (4) write outbox event `appointment.booked`; (5) release lock. Reminders scheduled via job-runner. Page: `.../schedule/book`.
- **Acceptance:** Two concurrent bookings for the same slot — exactly one succeeds, the other gets `SLOT_TAKEN`. Same booking called twice with same idempotency key → one appointment, same id. Booking writes AuditEvent + outbox event atomically.
- **Gate:** `bun run test -- appointment-booking.test.ts` (concurrency + idempotency + cross-tenant).

### TASK-022  Recurring appointments + waitlist  [Phase 2] [—] [Constraint #1]
- **Input:** TASK-021.
- **Output:** `recurring` flag + `recurrenceRule` (RRULE-ish string) on Appointment; `Waitlist` model; tRPC `appointments.createRecurring`, `waitlist.add`, `waitlist.promote` (when a slot frees).
- **Acceptance:** Creating "every Tuesday 10am for 6 weeks" produces 6 appointments; cancelling one promotes the first matching waitlist entry.
- **Gate:** `bun run test -- recurring-waitlist.test.ts`.

### TASK-023  Automated reminders  [Phase 2] [ADR-0002] [Constraint #13]
- **Input:** TASK-012 (job-runner), TASK-021.
- **Output:** Outbox handler `reminder.send` → calls `emailPort.send` (Resend adapter / console stub) and `smsPort.send` (Twilio adapter / console stub), both circuit-breaker-wrapped. Reminders scheduled 24h before appointment, second reminder 2h before.
- **Acceptance:** Booking an appointment creates 2 scheduled reminders; job-runner fires them at the scheduled time; circuit breaker opens if provider fails 50%.
- **Gate:** `bun run test -- reminders.test.ts`.

### TASK-024  SOAP notes  [Phase 2] [—] [Constraints #4, #12]
- **Input:** TASK-009, TASK-014.
- **Output:** `SoapNote` model (subjective, objective, assessment, plan — JSON-structured fields) linked to `Appointment` + `Patient`. tRPC `soapNotes` (create/update with optimistic lock, lock during edit via distributed lock to prevent two therapists editing simultaneously). Page: `.../patients/[id]/soap/[noteId]` with 4-section editor + autosave.
- **Acceptance:** Concurrent edits → 2nd gets 409; every save logs PHI AuditEvent; autosave debounced 3s.
- **Gate:** `bun run test -- soap-notes.test.ts` + axe-core on editor + `bun run build`.

### TASK-025  Treatment plans  [Phase 2] [—] [Constraint #1]
- **Input:** TASK-024.
- **Output:** `TreatmentPlan` (goals, frequency, duration, linked exercises) linked to Patient. tRPC router + page `.../patients/[id]/plans`.
- **Acceptance:** Create plan, attach exercises, mark goals achieved.
- **Gate:** `bun run test -- treatment-plans.test.ts` + `bun run build`.

### TASK-026  Outcome measures (DASH, Oswestry, KOOS)  [Phase 2] [—] [Constraint #1]
- **Input:** TASK-019.
- **Output:** `OutcomeMeasure` (type, score, maxScore, percent, responses JSON, takenAt). Built-in scoring for DASH (30 items), Oswestry (10 sections), KOOS (42 items). tRPC `outcomeMeasures.record` + `outcomeMeasures.trend` (delta over time). Page: `.../patients/[id]/outcomes` with trend chart (recharts).
- **Acceptance:** Recording a DASH produces correct 0–100 score; trend shows improvement over 3 recordings.
- **Gate:** `bun run test -- outcomes.test.ts` (scoring correctness) + `bun run build`.

### TASK-027  Exercise library + prescription + printable handout  [Phase 2] [ADR-0002] [Constraint #1]
- **Input:** TASK-025.
- **Output:** `Exercise` (name, description, sets, reps, hold, equipment, image URL), `ExercisePrescription` (link plan↔exercise with patient-specific parameters). Handout PDF generation via a server route `.../api/handout/[prescriptionId]` (uses a lightweight PDF lib or print-optimized HTML → browser print). Exercise images seeded from image-generation skill.
- **Acceptance:** Therapist prescribes 3 exercises → patient sees them in portal → printable handout renders all 3 with instructions.
- **Gate:** `bun run test -- exercises.test.ts` + Agent Browser handout render + `bun run build`.

### TASK-028  Patient search (PostgreSQL FTS substitute)  [Phase 2] [ADR-0001] [—]
- **Input:** TASK-019.
- **Output:** tRPC `search.patients(query)` using SQLite `LIKE` on name/email/phone + trigram-ish ranking (or a simple `name LIKE OR email LIKE`). Documented as sandbox substitute for PostgreSQL `tsvector` + `pg_trgm`.
- **Acceptance:** Searching "riv" returns "Rivera" patients; tenant-scoped; debounced 300ms on the client.
- **Gate:** `bun run test -- search.test.ts` (incl. cross-tenant returns 0).

---

## 5. Phase 3 Roadmap — Commercial Layer (months 8–11)

### TASK-029  Stripe subscription billing  [Phase 3] [ADR-0002] [Constraints #8, #13]
- **Input:** TASK-012, TASK-011.
- **Output:** `src/lib/ports/billing.ts` interface + `billing.stripe.ts` (Stripe SDK) + `billing.mock.ts` (sandbox). tRPC `billing.subscribe`, `billing.updateSeats`, `billing.cancel`. Webhook route `src/app/api/webhooks/stripe/route.ts` — **idempotent by `event.id`** (check `IdempotencyRecord`/`AuditEvent` for seen event IDs before processing). Proration + dunning handled by Stripe config. Saga pattern: create subscription → charge → activate tenant; compensating refund on failure.
- **Acceptance:** Replay the same webhook event 3× → subscription activated once. Circuit breaker opens on Stripe 50% failure.
- **Gate:** `bun run test -- stripe-webhook-idempotency.test.ts` + `bun run test -- billing-saga.test.ts`.

### TASK-030  Subscription plans + seat metering  [Phase 3] [—] [Constraint #8]
- **Input:** TASK-029, TASK-004.
- **Output:** `Subscription` linked to `Tenant` with `therapistSeats`, `supportSeats`, `stripeSubscriptionId`. Seat usage = count of active users by role. tRPC `billing.usage`. Proration on seat change (via Stripe API).
- **Acceptance:** Adding a therapist seat updates Stripe quantity; removing prorates.
- **Gate:** `bun run test -- seat-metering.test.ts`.

### TASK-031  Fee schedules  [Phase 3] [—] [Constraint #1]
- **Input:** TASK-002.
- **Output:** `FeeSchedule` (payer × CPT code × rate). tRPC `feeSchedules` CRUD. Seeded with common PT CPT codes (97110, 97140, 97014, 97161–97164, 97530, etc.).
- **Acceptance:** Fee schedule editable per payer; used in claim generation.
- **Gate:** `bun run test -- fee-schedules.test.ts`.

### TASK-032  Claim generation (CMS-1500)  [Phase 3] [—] [Constraints #4, #12]
- **Input:** TASK-019, TASK-024, TASK-031.
- **Output:** `Claim` model (patient, appointment, soapNote, cptCodes[], icdCodes[], chargeAmount, status). tRPC `claims.generate(appointmentId)` — derives CPT/ICD from SOAP note + appointment type, looks up fee schedule, creates Claim with `version=0`. CMS-1500 box mapping documented.
- **Acceptance:** Generate claim from a completed SOAP note → correct CPT codes + charges; claim is optimistic-locked; PHI logged.
- **Gate:** `bun run test -- claim-generation.test.ts`.

### TASK-033  Claim submission to clearinghouse (Office Ally stub)  [Phase 3] [ADR-0002] [Constraint #13]
- **Input:** TASK-011 (circuit breaker), TASK-012 (job-runner), TASK-032.
- **Output:** `src/lib/ports/clearinghouse.ts` + `clearinghouse.office-ally.ts` (stub) + `clearinghouse.mock.ts`. Outbox handler `claim.submit` → calls clearinghouse port, updates `Claim.status` (submitted/accepted/rejected), writes AuditEvent. Circuit-breaker-wrapped.
- **Acceptance:** Submitting a claim transitions status to `submitted`; if port fails 50%, circuit opens and claim stays `pending` with retry scheduled.
- **Gate:** `bun run test -- claim-submission.test.ts`.

### TASK-034  Payment posting  [Phase 3] [—] [Constraints #3, #4]
- **Input:** TASK-032.
- **Output:** `Payment` (claimId, amount, payer, postedAt, method). tRPC `payments.post` (idempotent). Applies to claim balance; updates `Claim.balance`.
- **Acceptance:** Duplicate payment post with same idempotency key → one Payment. Claim balance reduced correctly.
- **Gate:** `bun run test -- payment-posting.test.ts`.

### TASK-035  Patient statements + payment plans  [Phase 3] [—] [Constraint #1]
- **Input:** TASK-034.
- **Output:** `Statement` (patient, period, charges, payments, balance, pdfUrl). `PaymentPlan` (installments, amount, frequency). tRPC routers + pages `.../billing/statements`, `.../billing/payment-plans`.
- **Acceptance:** Generate monthly statement for a patient → PDF in storage, balance correct.
- **Gate:** `bun run test -- statements.test.ts` + `bun run build`.

### TASK-036  Audit log UI + PHI access review  [Phase 3] [—] [Constraints #12, #10]
- **Input:** TASK-014.
- **Output:** `src/app/(app)/settings/audit-log/page.tsx` — owner-only, paginated, filterable by actor/entity/phi. Export to CSV (R2/local).
- **Acceptance:** Owner sees all AuditEvents; non-owner roles get 403; PHI events filterable; export downloadable.
- **Gate:** `bun run test -- audit-ui.test.ts` + axe-core.

### TASK-037  Feature flag UI  [Phase 3] [—] [Doc 4 §12]
- **Input:** TASK-015.
- **Output:** `src/app/(app)/settings/feature-flags/page.tsx` — owner-only toggle per flag per tenant.
- **Acceptance:** Toggling a flag reflects in `isEnabled` within 5 min; non-owner 403.
- **Gate:** `bun run test -- feature-flags-ui.test.ts`.

---

## 6. Phase 4 Roadmap — Hardening & Launch (months 12–15)

### TASK-038  Patient portal — self-service booking  [Phase 4] [—] [Constraints #1, #5, #6]
- **Input:** TASK-021.
- **Output:** Patient-authenticated route group `src/app/(portal)/` with booking flow: choose appointment type → pick therapist → pick slot (uses the same distributed-lock booking path) → confirm. Mobile-first, WCAG 2.2 AA.
- **Acceptance:** Patient books own appointment; double-booking prevented; portal patient sees only their own data (RLS-equivalent enforced).
- **Gate:** `bun run test -- portal-booking.test.ts` + axe-core + Agent Browser.

### TASK-039  Patient portal — secure messaging  [Phase 4] [—] [Constraints #1, #12]
- **Input:** TASK-019.
- **Output:** `Message` (thread between patient and therapist). tRPC `messages.send`/`list`. Real-time via socket.io mini-service (port 3004, `?XTransformPort=3004`). PHI logged.
- **Acceptance:** Patient sends message → therapist sees it in app; therapist replies → patient sees in portal; messages tenant-scoped + PHI-logged.
- **Gate:** `bun run test -- messaging.test.ts` + Agent Browser.

### TASK-040  Patient portal — bill pay  [Phase 4] [ADR-0002] [Constraints #8, #13]
- **Input:** TASK-035, TASK-029.
- **Output:** Patient sees outstanding balance → pays via Stripe Checkout (test mode). Idempotent payment webhook.
- **Acceptance:** Patient pays statement → Payment posted → balance updated; duplicate webhook → one payment.
- **Gate:** `bun run test -- portal-bill-pay.test.ts`.

### TASK-041  Patient portal — intake forms  [Phase 4] [—] [Constraints #1, #12]
- **Input:** TASK-019.
- **Output:** Dynamic intake form builder (owner configures fields) + patient fills pre-visit → stored against Patient. PHI logged.
- **Acceptance:** Patient completes intake → data stored on Patient record; therapist sees it in the appointment context.
- **Gate:** `bun run test -- intake-forms.test.ts` + axe-core.

### TASK-042  Reporting & analytics  [Phase 4] [—] [Constraint #1]
- **Input:** TASK-019, TASK-021, TASK-024, TASK-032, TASK-034.
- **Output:** `src/app/(app)/reports/page.tsx` — clinic performance (visits, revenue, collections by month), therapist productivity (visits/therapist, notes completed on time), patient outcomes (avg DASH/KOOS delta), no-show rate, claim status/aging. All via tRPC `reports.*` using Prisma `groupBy`. Charts via recharts.
- **Acceptance:** Reports render for demo tenant with seeded data; numbers tie out to records; tenant-scoped.
- **Gate:** `bun run test -- reports.test.ts` + axe-core + `bun run build`.

### TASK-043  Observability — structured logs + metrics endpoint  [Phase 4] [ADR-0002] [Doc 1 §5.5]
- **Input:** —
- **Output:** `src/lib/ports/observability.ts` — structured JSON logger ( Datadog adapter / console adapter) with `trace_id` propagation. `/api/metrics` Prometheus-format endpoint (request count, latency histogram, error rate). Sentry adapter stub.
- **Acceptance:** Every request logs with trace_id; `/api/metrics` returns counters.
- **Gate:** `bun run test -- observability.test.ts`.

### TASK-044  Load testing (k6)  [Phase 4] [—] [Doc 4 §5]
- **Input:** TASK-042.
- **Output:** `tests/load/k6-script.js` — 10× peak load (500 concurrent users) against patient list + booking + SOAP save. Targets: p95 read < 300ms, p95 write < 800ms.
- **Acceptance:** k6 run report shows p95 within targets (or documents the sandbox bottleneck).
- **Gate:** `k6 run tests/load/k6-script.js` (documented; may be partial in sandbox).

### TASK-045  Accessibility audit  [Phase 4] [—] [Constraint #6]
- **Input:** All frontend tasks.
- **Output:** `tests/a11y/` — axe-core scripts for every page + a manual NVDA checklist document. Zero violations target.
- **Acceptance:** `bun run test:a11y` exits 0; manual checklist signed off.
- **Gate:** `bun run test:a11y` + manual review.

### TASK-046  HIPAA compliance review  [Phase 4] [—] [Constraint #12]
- **Input:** TASK-014, TASK-019, TASK-024, TASK-032.
- **Output:** `docs/compliance/hipaa-review.md` — PHI inventory, encryption-at-rest verification (SQLite file perms + production R2 SSE), BAA coverage checklist (AWS/Clerk/Stripe/Inngest/R2/Resend/Twilio), PHI access log sample, breach notification runbook.
- **Acceptance:** Every PHI store identified; every access logged; every subprocessor has BAA row (status: sandbox=stub, prod=required).
- **Gate:** Manual review + `bun run test -- hipaa-audit.test.ts` (asserts PHI reads always create AuditEvent).

### TASK-047  Cross-tenant isolation test suite (the starred gate)  [Phase 4] [ADR-0001] [Constraint #2]
- **Input:** All routers.
- **Output:** `tests/isolation/` — for every tenant-scoped router, a test that sets tenant-A context, creates a record in tenant-A, then switches to tenant-B context and attempts `get`/`list`/`update`/`delete` on tenant-A's record. **Must return 0 rows / 404 / 403.**
- **Acceptance:** 100% of tenant-scoped routers covered; all isolation tests green.
- **Gate:** `bun run test -- tests/isolation/` (the canonical gate for Constraint #2).

### TASK-048  Beta onboarding playbook  [Phase 4] [—] [Doc 4 §12]
- **Input:** —
- **Output:** `docs/gtm/beta-playbook.md` — design-partner agreement template, onboarding checklist (tenant provisioning, data import, training), success criteria, feedback loop.
- **Acceptance:** Document complete; reviewed by builder.
- **Gate:** Manual review.

### TASK-049  Canary deployment config + rollback  [Phase 4] [—] [Constraint #11]
- **Input:** TASK-018.
- **Output:** `.github/workflows/deploy.yml` — canary stages 5%→25%→50%→100% (15min each) with automated rollback if error rate >1% or p95 >500ms (reads Datadog/Sentry metrics).
- **Acceptance:** Dry-run of the workflow YAML validates; rollback condition documented.
- **Gate:** `actionlint` + manual review.

### TASK-050  Production cutover runbook  [Phase 4] [ADR-0001, ADR-0002] [—]
- **Input:** All ADRs.
- **Output:** `docs/ops/production-cutover.md` — step-by-step: provision PostgreSQL 16 + enable RLS policies (from ADR-0001 canonical text), swap each port adapter to production (ADR-0002), configure Stripe live keys, Office Ally credentials, Resend/Twilio, R2 bucket, Datadog, Sentry. Rollback plan.
- **Acceptance:** Runbook complete; dry-run walkthrough with builder.
- **Gate:** Manual review.

---

## 7. Dependency Summary (critical path)

```
TASK-000 (ADRs)
  └─ TASK-001 (packages) ─┐
  └─ TASK-002 (schema) ───┤
        └─ TASK-003 (domain schema)
              ├─ TASK-004 (seed)
              ├─ TASK-005 (tenant extension) ─ TASK-006 (context mw) ─ TASK-007 (tRPC)
              │       └─ TASK-008 (idempotency), TASK-010 (lock), TASK-013 (auth), TASK-014 (audit)
              ├─ TASK-009 (optimistic lock)
              ├─ TASK-010a (rate limit)
              ├─ TASK-012 (outbox + job-runner)
              └─ TASK-015 (feature flags)
TASK-016 (landing page) — independent
TASK-017 (app shell) — needs TASK-013
TASK-018 (CI/CD) — independent

Phase 2: TASK-019 (patients) → TASK-020 (schedule primitives) → TASK-021 (booking, CRITICAL)
                             → TASK-024 (SOAP) → TASK-025 (plans) → TASK-027 (exercises)
                             → TASK-026 (outcomes)
Phase 3: TASK-029 (Stripe) → TASK-030 (seats); TASK-032 (claims) → TASK-033 (submit) → TASK-034 (payments)
Phase 4: TASK-038–041 (portal), TASK-042 (reports), TASK-047 (isolation suite, BLOCKS launch)
```

**Critical path:** TASK-000 → 002 → 003 → 005 → 006 → 007 → 008/010/013 → 019 → 020 → **021** → 024 → 032 → 033 → 042 → **047** → 050.

---

## 8. Constraint Coverage Matrix (every constraint mapped to tasks)

| # | Constraint | Tasks satisfying it |
|---|---|---|
| 1 | tenant_id + RLS on every tenant-scoped table | TASK-002, 003, 005, 006 (app-layer); all domain tasks |
| 2 | Cross-tenant access tests return 0 rows | TASK-005, 019, 028, **047** (canonical suite) |
| 3 | Idempotency middleware on every write | TASK-008; applied in 019, 021, 034, 040 |
| 4 | Optimistic locking on Patient/Appointment/SoapNote/Claim | TASK-009; applied in 019, 021, 024, 032, 034 |
| 5 | Distributed lock on appointment booking | TASK-010, 021, 038 |
| 6 | WCAG 2.2 AA (axe-core 0 violations) | TASK-016, 017, 019, 024, 036, 038, 041, 045 |
| 7 | UI not AI-generated (Major Third, motion, elevation, neutral palette) | TASK-016, 017 (design system), all UI tasks |
| 8 | Stripe webhook idempotency (event ID dedup) | TASK-029, 030, 040 |
| 9 | ADR for every significant decision | TASK-000 (4 ADRs); each task cites governing ADR |
| 10 | CI/CD on every commit (lint/type/test/security/a11y/build) | TASK-018; `scripts/gate.sh` runs on every task |
| 11 | Canary deployment 5→25→50→100% w/ auto-rollback | TASK-018, 049 |
| 12 | PHI encrypted at rest + access logged + BAAs | TASK-014 (logging), 019/024/032 (PHI), 046 (review) |
| 13 | Circuit breaker for external services | TASK-011; applied in 023, 029, 033, 040 |
| 14 | Shared task ledger + durable execution | TASK-012 (outbox+job-runner), worklog.md (ledger) |

---

## 9. Phase 2 Verification Gate (self-check)

| Gate criterion | Status |
|---|---|
| Every task has unique ID (TASK-000 through TASK-050) | ✅ |
| Every task has Input / Output / Acceptance / Gate | ✅ |
| Tasks grouped by 4 roadmap phases | ✅ (Phase 0 bootstrap + Phases 1–4) |
| Phase 1 roadmap tasks: schema, auth, RLS(mw), middleware, CI/CD, IaC | ✅ (TASK-002–018) |
| Phase 2 roadmap tasks: patients, appointments, SOAP, exercises | ✅ (TASK-019–028) |
| Phase 3 roadmap tasks: billing, claims, feature flags, audit log | ✅ (TASK-029–037) |
| Phase 4 roadmap tasks: portal, reporting, testing, beta, rollout | ✅ (TASK-038–050) |
| Every constraint mapped to ≥1 task | ✅ (§8 matrix) |
| ADRs referenced before implementation | ✅ (TASK-000 first) |
| NO IMPLEMENTATION CODE written in Phase 2 | ✅ (this document only) |

---

*End of Phase 2 Build Plan. Awaiting builder approval before Phase 3 (Implementation) begins with TASK-000.*
