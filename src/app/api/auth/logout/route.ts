/**
 * Authentication API — Logout (TASK-013)
 *
 * Revokes the session by setting revokedAt on the Session record and
 * clearing the cookie. Per DOC1 §7.6: "opaque tokens can be revoked
 * instantly by deleting the session record."
 */

import { NextRequest, NextResponse } from 'next/server';
import { baseDb } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '../login/route';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // Revoke the session (set revokedAt — keeps the record for audit)
    await baseDb.session.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
