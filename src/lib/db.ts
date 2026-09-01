/**
 * Prisma Client with tenant isolation extension (ADR-0001)
 *
 * The base PrismaClient is extended with the tenant extension that:
 *   - Injects tenantId into every query's WHERE clause (from AsyncLocalStorage)
 *   - Injects tenantId into every create's data block (from context, never client)
 *   - Strips tenantId from update data (tenant cannot change)
 *   - Fail-closed: raises TENANT_CONTEXT_REQUIRED if no context on tenant-scoped models
 *
 * Constraint #1: tenant_id on every tenant-scoped table
 * Constraint #2: cross-tenant access tests must return zero rows
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { tenantExtension } from '@/lib/db/tenant-extension';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const baseClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Disable query logging to prevent OOM in sandbox (each query logs ~200 bytes)
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
  });

/** The extended Prisma client with automatic tenant isolation. */
export const db = baseClient.$extends(tenantExtension);

/**
 * The BASE Prisma client (without tenant extension).
 * Use for auth operations that need cross-tenant access (login, signup,
 * session lookup). NOT for application queries — those should use `db`.
 */
export const baseDb = baseClient;

/** Transaction client type (for writeOutbox and other transactional operations). */
export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$extend' | '$on' | '$transaction' | '$use' | '$disconnect'
>;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = baseClient;
