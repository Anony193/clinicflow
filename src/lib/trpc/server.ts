/**
 * tRPC Server Caller (ADR-0004)
 *
 * For use in Server Components and Server Actions.
 * Creates a typed caller that can be invoked directly without going through HTTP.
 *
 * Usage:
 *   const caller = await getServerTRPC();
 *   const stats = await caller.stats.overview();
 *
 * The tenant context is set via runInTenantContext() if a session is available.
 */

import { appRouter } from '@/server/routers/_app';
import { createContextInner } from '@/server/context';
import { resolveSessionFromHeaders } from '@/lib/auth-session';
import { runInTenantContext } from '@/lib/context/tenant-context';
import { headers } from 'next/headers';

/**
 * Create a tRPC caller for server-side use.
 * Resolves the session from the request headers (cookies).
 */
export async function getServerTRPC() {
  const headerList = await headers();
  const req = new Request('http://localhost:3000/api/trpc', {
    headers: headerList,
  });
  const session = await resolveSessionFromHeaders(req);
  const tenantId = session?.tenantId ?? null;

  // Run within the tenant context so Prisma extension can read tenantId
  return runInTenantContext(tenantId, async () => {
    const ctx = createContextInner({ session });
    return appRouter.createCaller(ctx);
  });
}
