/**
 * Authentication API — Logout (TASK-013)
 * Revokes the session and redirects to login page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { baseDb } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '../login/route';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await baseDb.session.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.redirect(new URL('/login', req.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
