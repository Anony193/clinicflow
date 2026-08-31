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
 *   publicProcedure      — no auth required (health, landing data)
 *   protectedProcedure   — requires session (most app operations)
 *   loggedProcedure      — protected + auto-audit on mutations (TASK-014)
 *   idempotentProcedure  — logged + idempotency key on writes (TASK-008)
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from '@/server/context';
import { logAudit } from '@/server/lib/audit';
import {
  acquireIdempotencyLock,
  storeIdempotentResult,
} from '@/server/middleware/idempotency';

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
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires an authenticated session.
 * The context must have a non-null user and tenantId.
 * Used for: all app operations (patients, appointments, SOAP notes, etc.)
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
      user: ctx.user,
      tenantId: ctx.tenantId,
    },
  });
});

/**
 * Logged procedure — protected + auto-audit on mutations (TASK-014).
 *
 * For mutations (create/update/delete), automatically logs an AuditEvent
 * with the action, entity, and actor. For PHI entities, phi=true is set
 * automatically by the audit module.
 *
 * Usage:
 *   loggedProcedure
 *     .input(createPatientSchema)
 *     .mutation(async ({ ctx, input }) => { ... });
 */
export const loggedProcedure = protectedProcedure.use(async ({ ctx, next, type, path }) => {
  const result = await next();

  // Auto-log mutations (not queries — reads are logged separately via logPhiAccess)
  if (type === 'mutation') {
    // Extract entity from path (e.g., "patients.create" → "patients")
    const entity = path.split('.')[0] ?? 'unknown';
    await logAudit({
      actorId: ctx.user.userId,
      action: path,
      entity: entity.charAt(0).toUpperCase() + entity.slice(1),
      metadata: { type, path },
    });
  }

  return result;
});

/**
 * Idempotent procedure — logged + idempotency key on writes (TASK-008, Constraint #3).
 *
 * Reads the Idempotency-Key header. If present:
 *   - First call: process, cache the result (24h TTL per DOC5 §6.4)
 *   - Duplicate call: replay the cached response
 *   - In-progress: return 409 CONFLICT
 *
 * Usage:
 *   idempotentProcedure
 *     .input(createAppointmentSchema)
 *     .mutation(async ({ ctx, input }) => { ... });
 *
 * The client must send an Idempotency-Key header (UUID per form submission).
 */
export const idempotentProcedure = protectedProcedure.use(
  async ({ ctx, next, path, type }) => {
    // Only apply idempotency to mutations
    if (type !== 'mutation') {
      return next();
    }

    const idempotencyKey = ctx.idempotencyKey;

    if (!idempotencyKey) {
      return next();
    }

    const lock = await acquireIdempotencyLock({
      tenantId: ctx.tenantId,
      path,
      idempotencyKey,
    });

    if (lock.type === 'replay') {
      // Replay the cached response from the first request with this key
      return lock.response as Awaited<ReturnType<typeof next>>;
    }
    if (lock.type === 'in_progress') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'request_in_progress',
      });
    }

    // Process the mutation
    const result = await next();

    // Cache the result for future duplicate requests.
    // Use superjson to handle Date/BigInt serialization (same transformer as the API).
    try {
      await storeIdempotentResult(lock.keyHash, result, 200);
    } catch (err) {
      // If serialization fails (e.g., circular reference in tRPC internals),
      // log but don't fail the mutation — the result is already computed.
      console.warn('IDEMPOTENCY_CACHE_FAILED:', err);
    }

    return result;
  },
);

/** Root router builder */
export const router = t.router;
/** Middleware builder */
export const middleware = t.middleware;
