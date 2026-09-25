/**
 * Patient Portal Logout API (TASK-038)
 * Clears the portal cookie and redirects to portal login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_COOKIE } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/portal/login', req.url));
  response.cookies.delete(PORTAL_COOKIE);
  return response;
}
