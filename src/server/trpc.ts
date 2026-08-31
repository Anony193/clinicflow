/**
 * tRPC Server Initialization (ADR-0004, DOC3 §7/§8)
 *
 * The type-safe toolchain: Zod + Prisma + tRPC + TanStack Query (DOC3 §8)
 * - superjson transformer for Date/BigInt serialization across the wire
 * - Error model: discriminated union errors via TRPCError (DOC3 §9.1)
 * - Pagination: cursor-based via useInfiniteQuery (DOC3 §9.2)
 * - Optimistic updates: onMutate pattern (DOC3 §9.3)
 *
 * Procedure hierarchy:
 *   publicProcedure    — no auth required (health, landing data)
 *   protectedProcedure — requires session (most app operations)
 *
 * Future procedures (added in later tasks):
 *   loggedProcedure     — auto-audit (TASK-014)
 *   idempotentProcedure — idempotency key on writes (TASK-008)
 *   rateLimitedProcedure — token bucket rate limiting (TASK-010a)
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from '@/server/context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Discriminated union error shape (DOC3 §9.1)
    // Every error has a code field (identifies error type) + message (human-readable)
    return {
      ...shape,
      data: {
        ...shape.data,
        // Attach the error code for frontend type-narrowing
        code: error.code,
      },
    };
  },
});

/**
 * Public procedure — no authentication required.
 * Used for: health checks, public landing page data.
 * NOTE: tenant-scoped queries will fail (TENANT_CONTEXT_REQUIRED)
 * unless wrapped in bypassTenantCheck().
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires an authenticated session.
 * The context must have a non-null user and tenantId.
 * Used for: all app operations (patients, appointments, SOAP notes, etc.)
 *
 * Future: this will be extended with audit logging (TASK-014) and
 * idempotency (TASK-008) via middleware composition.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.tenantId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please sign in.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript narrows to non-null
      tenantId: ctx.tenantId,
    },
  });
});

/** Root router builder */
export const router = t.router;
/** Middleware builder */
export const middleware = t.middleware;
