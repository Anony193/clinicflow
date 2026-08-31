/**
 * Session Resolver (TASK-013 — real authentication)
 *
 * Resolves the session from the httpOnly cookie → Session table → User.
 *
 * DOC1 §7.6: "The session token is a random, opaque value; it is not a
 * JSON Web Token containing user data, because opaque tokens can be revoked
 * instantly by deleting the session record."
 *
 * Flow:
 *   1. Read the `clinicflow-session` cookie
 *   2. Look up the Session record (must not be expired or revoked)
 *   3. Return the session with user info
 */

import { baseDb } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'clinicflow-session';

export interface Session {
  userId: string;
  tenantId: string;
  role: string;
  name: string;
  email: string;
}

/**
 * Resolve the session from a Request.
 * Reads the httpOnly cookie, looks up the Session record.
 */
export async function resolveSession(req: Request): Promise<Session | null> {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const token = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!token) return null;

  // Look up the session (use baseDb — no tenant extension, auth is cross-tenant)
  const session = await baseDb.session.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session || !session.user) return null;

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };
}

/**
 * Resolve session from Next.js headers() — for Server Components.
 */
export async function resolveSessionFromHeaders(
  req: Request,
): Promise<Session | null> {
  return resolveSession(req);
}
