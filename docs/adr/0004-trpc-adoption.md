# ADR-0004 — tRPC v11 adoption for type-safe internal API

- **Status:** Proposed (approved for Phase 3 implementation)
- **Date:** Phase 2 / Task TASK-000
- **Governs constraints:** #3 (idempotency middleware), #10 (CI/CD type-check gate)
- **Related docs:** Doc 3 §7 (API Style Selection, Table 4), §8 (Type-Safe Toolchain), §9 (Error Handling, Pagination, Optimistic Updates)

## Context
The spec mandates **tRPC v11 for internal communication** (Doc 3 §7) with **zero-step type safety** — frontend types inferred from the backend, no codegen (Doc 3 §8). The type-safe toolchain is **Zod + Prisma + tRPC + TanStack Query** (Doc 3 §8 code block). The sandbox `package.json` does not yet include tRPC packages.

## Decision
1. **Install in TASK-001:** `@trpc/server@^11`, `@trpc/client@^11`, `@trpc/react-query@^11`, `@trpc/next@^11`, `superjson` (for `Date` / `BigInt` serialization across the wire).
2. **Transport:** Next.js App Router API route at `src/app/api/trpc/[trpc]/route.ts` using `fetchRequestHandler`.
3. **Server:** `src/server/trpc.ts` (`initTRPC.create({ transformer: superjson })`), `src/server/context.ts` (creates context from request: `user`, `tenantId`, `role`), `src/server/routers/_app.ts` (root router).
4. **Client:** `src/lib/trpc/client.ts` (`createTRPCReact` + `httpBatchLink`), provider in `src/app/providers.tsx`.
5. **Server-side caller:** `src/lib/trpc/server.ts` (`createCaller` for server components).
6. **Middleware composition:** `publicProcedure` · `protectedProcedure` (requires session) · `loggedProcedure` (auto-audit, TASK-014) · `idempotentProcedure` (TASK-008, write endpoints) · `rateLimitedProcedure` (TASK-010a).
7. **Error model:** discriminated union errors (Doc 3 §9) — `TRPCError` with codes `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, `CONFLICT` (optimistic-lock), `TOO_MANY_REQUESTS`, `PRECONDITION_FAILED` (tenant context), `INTERNAL_SERVER_ERROR`.
8. **Pagination:** cursor-based (Doc 3 §9) — `{ items, nextCursor }`.
9. **Optimistic updates:** TanStack Query `onMutate` pattern (Doc 3 §9) on patient/appointment mutations.

## Consequences
- **Positive:** End-to-end type safety with zero codegen. Refactoring a procedure's input/output instantly type-errors on the frontend. Zod schemas serve as both the runtime validator and the TypeScript type. Contract tests are free (the type system *is* the contract — Doc 4 §5 Table 2 row 4).
- **Negative:** tRPC over Next.js App Router requires careful server/client boundary discipline. Server components use `createCaller`; client components use the React hooks. Both share the same router type.
- **Public endpoints stay REST:** Stripe webhooks (`/api/webhooks/stripe`), OAuth callbacks, and health checks remain plain Next.js route handlers — they don't need the tRPC context.

## Status
Proposed → Approved for implementation.
