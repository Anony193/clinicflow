/**
 * tRPC Context (ADR-0004, DOC3 §8)
 *
 * Created per-request. Contains:
 *   - db: the Prisma client with tenant extension (tenantId injected via AsyncLocalStorage)
 *   - user: the authenticated user (or null for public routes)
 *   - tenantId: the current tenant (or null for public routes)
 *   - idempotencyKey: the Idempotency-Key header (for write endpoints, Constraint #3)
 *
 * The AsyncLocalStorage tenant context is set by the API route handler
 * (src/app/api/trpc/[trpc]/route.ts) BEFORE this context creator runs,
 * wrapping the entire fetchRequestHandler in runInTenantContext().
 */

import type { Session } from '@/lib/auth-session';
import { db } from '@/lib/db';

export interface CreateInnerContextOptions {
  session: Session | null;
  idempotencyKey?: string;
}

export interface Context extends CreateInnerContextOptions {
  db: typeof db;
  user: Session | null;
  tenantId: string | null;
  idempotencyKey?: string;
}

/**
 * Create the tRPC context from the inner context options.
 * Called by fetchRequestHandler for each request.
 */
export function createContextInner(opts: CreateInnerContextOptions): Context {
  return {
    db,
    user: opts.session,
    tenantId: opts.session?.tenantId ?? null,
    session: opts.session,
    idempotencyKey: opts.idempotencyKey,
  };
}

/**
 * Context creator for fetchRequestHandler.
 * The session is resolved by the API route handler and passed in.
 */
export function createContext(opts: CreateInnerContextOptions): Context {
  return createContextInner(opts);
}
