/**
 * Next.js Proxy (Middleware) — Routing-level auth check
 *
 * Staff routes (/app/*) require the staff session cookie.
 * Portal routes (/portal/*) are handled by the portal layout (separate cookie).
 * Public routes don't require any auth.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STAFF_COOKIE = 'clinicflow-session';
const STAFF_PROTECTED_PREFIX = '/app';
const PUBLIC_ROUTES = new Set(['/', '/login', '/signup', '/portal/login']);
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/portal', '/api/trpc/health', '/api/webhooks'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicRoute =
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isStaffProtected = pathname.startsWith(STAFF_PROTECTED_PREFIX);

  const staffCookie = req.cookies.get(STAFF_COOKIE)?.value;

  // Staff protected route without staff session → redirect to staff login
  if (isStaffProtected && !staffCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated staff visiting login → redirect to app
  if (staffCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/app', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|hero-illustration.png).*)'],
};
