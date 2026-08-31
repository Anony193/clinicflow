/**
 * Session Resolver — PLACEHOLDER
 *
 * TASK-013 will replace this with NextAuth credentials provider.
 * For now, this supports a demo mode via the x-demo-tenant-id header/cookie
 * so we can verify the tenant isolation stack end-to-end.
 *
 * In production (DOC1 §7.6 Authentication Flow):
 *   - User submits credentials
 *   - System validates against stored password hash (argon2)
 *   - On success, creates a Session record and returns an opaque session token
 *   - The session token is NOT a JWT (opaque tokens can be revoked instantly)
 */

export interface Session {
  userId: string;
  tenantId: string;
  role: string;
  name: string;
  email: string;
}

/**
 * Resolve the session from a Request.
 * Reads the demo-tenant-id cookie or x-demo-tenant-id header for testing.
 *
 * TODO: TASK-013 — implement NextAuth credentials provider + argon2 password
 * verification + opaque session token in the Session table.
 */
export async function resolveSession(req: Request): Promise<Session | null> {
  // Check for demo tenant cookie (set by the demo login page) or header
  const cookieHeader = req.headers.get('cookie') ?? '';
  const demoTenantFromCookie = cookieHeader
    .match(/demo-tenant-id=([^;]+)/)?.[1];
  const demoTenantId =
    req.headers.get('x-demo-tenant-id') ?? demoTenantFromCookie;

  if (demoTenantId) {
    return {
      userId: 'demo-user',
      tenantId: demoTenantId,
      role: 'OWNER',
      name: 'Demo User',
      email: 'demo@clinicflow.test',
    };
  }

  // TODO: TASK-013 — NextAuth session resolution
  return null;
}

/**
 * Resolve session from Next.js headers() — for Server Components.
 * Same logic as resolveSession but reads from the headers() API.
 */
export async function resolveSessionFromHeaders(
  req: Request,
): Promise<Session | null> {
  return resolveSession(req);
}
