/**
 * tRPC API Route Handler (ADR-0004, DOC3 §7/§8)
 *
 * Next.js App Router route handler for tRPC.
 *
 * CRITICAL: This is where the tenant context (AsyncLocalStorage) is set.
 * The flow (per DOC1 §7.6 Request Lifecycle with Tenant Context):
 *   1. Request arrives with session cookie
 *   2. We resolve the session → get tenantId
 *   3. We wrap fetchRequestHandler in runInTenantContext(tenantId, ...)
 *   4. Inside, tRPC creates the context and runs procedures
 *   5. The Prisma extension reads tenantId from AsyncLocalStorage
 *   6. Every query is automatically filtered to the current tenant
 *
 * In production (PostgreSQL), step 3 is replaced by:
 *   SET LOCAL app.current_tenant_id = '[tenant_id]'
 * at the start of each database transaction.
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { resolveSession } from '@/lib/auth-session';
import { runInTenantContext } from '@/lib/context/tenant-context';

const createContextWithSession = async (opts: { req: Request; resHeaders?: Headers }) => {
  const session = await resolveSession(opts.req);
  const idempotencyKey = opts.req.headers.get('idempotency-key') ?? undefined;
  return createContext({ session, idempotencyKey });
};

async function handler(req: Request) {
  // Resolve the session to determine the tenant context
  const session = await resolveSession(req);
  const tenantId = session?.tenantId ?? null;

  // Wrap the entire tRPC handler in the tenant context.
  // This makes tenantId available to the Prisma extension via AsyncLocalStorage.
  return runInTenantContext(tenantId, () =>
    fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: createContextWithSession,
    }),
  );
}

export { handler as GET, handler as POST };
