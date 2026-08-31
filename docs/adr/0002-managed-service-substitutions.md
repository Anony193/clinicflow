# ADR-0002 — Managed-service substitutions for sandbox (ports/ abstraction)

- **Status:** Proposed (approved for Phase 3 implementation)
- **Date:** Phase 2 / Task TASK-000
- **Governs constraints:** #8 (Stripe webhook idempotency), #13 (circuit breaker for external services), #14 (durable execution / shared task ledger)
- **Related docs:** Doc 3 §5; Doc 5 §5.5, §6.3, §6.4, §7; Doc 6 §5.2

## Context
The target stack (Phase 1 synthesis §d) depends on managed services that are **not provisioned** in the sandbox: Redis 7, Inngest, Clerk, Stripe (live), Office Ally, Cloudflare R2, Resend, Twilio, Datadog, Sentry. The spec is prescriptive about each (e.g., Redis distributed locks with `SET NX PX`, Stripe idempotent webhooks deduplicated by `event.id`, Inngest durable execution, circuit breakers around every external call). We need the system to behave correctly in the sandbox while remaining a one-config-swap from production.

## Decision
Introduce a **`src/lib/ports/` abstraction layer** (Dependency Inversion). Each external dependency has an interface and two adapters selected by `process.env.NODE_ENV` / feature flags:

| Port | Interface | Sandbox adapter | Production adapter |
|---|---|---|---|
| `lock` | `DistributedLock.acquire(key, ttlMs)` | SQLite `Lock` table (`INSERT OR NOTHING` on unique `key` + `expiresAt`) | Redis `SET NX PX` |
| `cache` | `Cache.get/set/del` | in-memory LRU | Redis |
| `queue` | `enqueue(event)`, polling worker | `mini-services/job-runner` (port 3003) polling `Outbox` table every 2s | Inngest |
| `auth` | NextAuth provider | credentials provider (argon2) | Clerk (SAML SSO for enterprise) |
| `billing` | `subscribe/updateSeats/cancel`, webhook | Stripe **test mode** + mock webhook replayer | Stripe live |
| `clearinghouse` | `submitClaim(claim)` | stub returning `submitted` w/ injected failure rate | Office Ally API |
| `storage` | `presignUpload/presignDownload` | local `/upload` dir + signed-URL handler | Cloudflare R2 (S3 API) |
| `email` | `send(to, template, vars)` | console + DB log (`Notification` table) | Resend |
| `sms` | `send(to, body)` | console + DB log | Twilio |
| `observability` | `logger`, `metric`, `span` | structured JSON to stdout + `/api/metrics` | Datadog |
| `errors` | `captureException` | console | Sentry |

**Every external call is wrapped by the circuit breaker** (`src/lib/ports/circuit-breaker.ts`, TASK-011) regardless of adapter — Constraint #13.

**Idempotency** (Constraint #3, #8): the `Idempotency-Key` middleware (TASK-008) and the Stripe webhook `event.id` dedup both use the `IdempotencyRecord` table — adapter-agnostic.

**Durable execution** (Constraint #14): the outbox pattern (`src/lib/outbox.ts`, TASK-012) writes the event in the same DB transaction as the write; the job-runner mini-service (port 3003) polls and dispatches with retry+backoff. This is the Inngest substitute; production swaps the runner for Inngest without touching call sites.

## Consequences
- **Positive:** Business logic depends only on interfaces; production cutover is an env-var swap documented in TASK-050. Tests can inject fake adapters. The circuit breaker + idempotency + outbox patterns are exercised identically in sandbox and prod.
- **Negative:** Sandbox adapters are weaker (in-memory cache lost on restart, SQLite locks not distributed across processes, no real Stripe charges). Acceptable for the demo/beta path; production gates in TASK-050 enforce the swap before launch.
- **Single-port gateway (ADR-0003):** the job-runner mini-service listens on port 3003 and is reached via `?XTransformPort=3003`. No absolute URLs anywhere.

## Status
Proposed → Approved for implementation.
