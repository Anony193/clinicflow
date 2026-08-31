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
 * The tenant context is set via runInTenantContext() for each call.
 */

import { appRouter } from '@/server/routers/_app';
import { createContextInner } from '@/server/context';
import { resolveSession } from '@/lib/auth-session';
import { runInTenantContext } from '@/lib/context/tenant-context';
import { headers } from 'next/headers';

type AppCaller = ReturnType<typeof appRouter.createCaller>;

/**
 * Create a tRPC caller for server-side use.
 * Resolves the session from the request cookies.
 *
 * IMPORTANT: Each procedure call must be wrapped in runInTenantContext()
 * at the call site. This function returns a helper that does that wrapping.
 */
export async function getServerTRPC() {
  const headerList = await headers();
  const cookie = headerList.get('cookie') ?? '';
  const req = new Request('http://localhost:3000', { headers: { cookie } });
  const session = await resolveSession(req);
  const tenantId = session?.tenantId ?? null;
  const ctx = createContextInner({ session });

  /**
   * Run a function within the tenant context.
   * Usage: const result = await caller.run((c) => c.patients.get({ id }));
   */
  async function run<T>(fn: (caller: AppCaller) => Promise<T>): Promise<T> {
    return runInTenantContext(tenantId, () => {
      const caller = appRouter.createCaller(ctx);
      return fn(caller);
    });
  }

  return { run };
}

/**
 * Convenience: create a caller and run a single operation.
 * Usage: const patient = await serverTRPC((c) => c.patients.get({ id }));
 */
export async function serverTRPC<T>(
  fn: (caller: AppCaller) => Promise<T>,
): Promise<T> {
  const { run } = await getServerTRPC();
  return run(fn);
}
