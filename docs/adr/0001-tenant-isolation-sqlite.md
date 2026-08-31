# ADR-0001 — Tenant isolation under SQLite (sandbox adaptation of PostgreSQL RLS)

- **Status:** Proposed (approved for Phase 3 implementation)
- **Date:** Phase 2 / Task TASK-000
- **Governs constraints:** #1 (tenant_id + RLS on every tenant-scoped table), #2 (cross-tenant access tests return zero rows)
- **Related docs:** Doc 1 §7.5 Table 2; Doc 5 §6; Doc 6 §4.2

## Context
The ClinicFlow specification (Phase 1 synthesis §d) mandates **PostgreSQL 16 with Row-Level Security** on every tenant-scoped table. The canonical RLS policy is:

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON <table>
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

The current sandbox ships **Prisma + SQLite** (`prisma/schema.prisma` `provider = "sqlite"`, `db/custom.db`). SQLite has **no Row-Level Security** primitive. Switching the sandbox to PostgreSQL is not an option in this environment (single-port, no managed DB).

## Decision
Implement **application-enforced tenant isolation** that preserves the production RLS target verbatim while running on SQLite:

1. **Schema:** Every tenant-scoped model has `tenantId String` + `@@index([tenantId])`. Concurrent entities (`Patient`, `Appointment`, `SoapNote`, `Claim`) additionally have `version Int @default(0)` for optimistic locking (Constraint #4).
2. **Prisma client extension** (`src/lib/db/tenant-extension.ts`): reads `tenantId` from an `AsyncLocalStorage` context (set per-request by middleware) and:
   - injects `tenantId` into every `findMany` / `findFirst` / `findUnique` / `update` / `updateMany` / `delete` / `deleteMany` / `count` `where` clause;
   - injects `tenantId` into every `create` / `createMany` / `upsert` `data` block (from context, **never** from client input);
   - **raises `TENANT_CONTEXT_REQUIRED`** if a tenant-scoped model is queried without an active tenant context (fail-closed).
3. **Request middleware** (`src/middleware.ts`): resolves `tenantId` from the session and runs the request handler inside `runInTenantContext(tenantId, fn)`.
4. **Cross-tenant isolation test suite** (`tests/isolation/`, TASK-047) — the canonical safety net. For every tenant-scoped router: tenant-A creates a record, switch to tenant-B context, attempt `get` / `list` / `update` / `delete` on tenant-A's record → **must return 0 rows / 404 / 403** (Constraint #2).

## Consequences
- **Positive:** No business-logic changes when cutting over to PostgreSQL in production. Cutover = (a) run `CREATE POLICY` statements (canonical text preserved below), (b) drop the app-layer extension. App behavior is unchanged because every query already filters by `tenantId`.
- **Negative:** Isolation strength is application-layer (not DB-layer). A bug in the extension or a raw-SQL escape hatch would leak data. **Mitigations:** (i) Prisma's typed client has no raw-SQL surface by default; (ii) the isolation test suite is the launch-blocker gate (TASK-047); (iii) an ESLint rule forbids `db.$queryRaw` / `db.$executeRaw` on tenant-scoped models.
- **Canonical production RLS text (preserved verbatim for the cutover runbook, TASK-050):**
  ```sql
  ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON "Patient"
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
  -- repeat for every tenant-scoped table
  ```

## Status
Proposed → Approved for implementation. Production cutover tracked in TASK-050.
