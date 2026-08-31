/**
 * Tenant Context — AsyncLocalStorage-based tenant isolation
 *
 * This is the sandbox adaptation of PostgreSQL Row-Level Security (ADR-0001).
 * In production (PostgreSQL), the pattern is:
 *   SET LOCAL app.current_tenant_id = '[tenant_id]'  (DOC1 §7.6)
 *   USING (tenant_id = current_setting('app.current_tenant_id')::uuid)  (DOC1 §7.5)
 *
 * In the SQLite sandbox, we emulate this at the application layer:
 *   1. The API route handler resolves the tenantId from the session
 *   2. It wraps the request handler in runInTenantContext(tenantId, fn)
 *   3. The Prisma tenant-extension reads tenantId from here and injects it
 *      into every query's WHERE clause and every create's data block
 *
 * Constraint #1: tenant_id on every tenant-scoped table
 * Constraint #2: cross-tenant access tests must return zero rows
 */

import { AsyncLocalStorage } from 'node:async_hooks';

const tenantStorage = new AsyncLocalStorage<string>();
const bypassStorage = new AsyncLocalStorage<boolean>();

/**
 * Get the current tenant ID from the async context.
 * Returns undefined if no tenant context is set (e.g., public routes).
 */
export function getTenantId(): string | undefined {
  return tenantStorage.getStore();
}

/**
 * Check whether a tenant context is currently active.
 */
export function hasTenantContext(): boolean {
  return tenantStorage.getStore() !== undefined;
}

/**
 * Check whether tenant checks are bypassed (e.g., auth lookup during login).
 */
export function isBypassActive(): boolean {
  return bypassStorage.getStore() === true;
}

/**
 * Run a function within a tenant context.
 * All Prisma queries on tenant-scoped models within `fn` will be
 * automatically filtered to `tenantId`.
 *
 * If tenantId is null (public route), the function runs without a
 * tenant context — tenant-scoped queries will raise TENANT_CONTEXT_REQUIRED
 * unless wrapped in bypassTenantCheck().
 */
export async function runInTenantContext<T>(
  tenantId: string | null,
  fn: () => Promise<T>,
): Promise<T> {
  if (tenantId) {
    return tenantStorage.run(tenantId, fn);
  }
  return fn();
}

/**
 * Bypass tenant checks for a specific operation.
 *
 * Use case: auth lookup during login — before a session exists, we need
 * to query the User table to verify credentials. The user hasn't
 * authenticated yet, so there's no tenant context. This bypass allows
 * the query to proceed without tenant filtering.
 *
 * WARNING: Only use for auth flows and admin operations. Misuse can
 * leak cross-tenant data.
 */
export async function bypassTenantCheck<T>(fn: () => Promise<T>): Promise<T> {
  return bypassStorage.run(true, fn);
}
