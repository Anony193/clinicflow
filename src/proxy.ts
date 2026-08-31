/**
 * Next.js Proxy (Middleware) — Routing-level auth check (TASK-006/013)
 *
 * Checks for the session cookie on protected routes (/app/*).
 * If not authenticated, redirects to /login.
 *
 * Public routes: /, /login, /signup, /api/auth/*, /api/trpc/*
 * Protected routes: /app/*
 *
 * NOTE: This only checks for cookie PRESENCE (not validity).
 * The actual session validation happens in the tRPC context resolver
 * and the app layout (which queries the Session table).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'clinicflow-session';
const PROTECTED_PREFIX = '/app';
const PUBLIC_ROUTES = new Set(['/', '/login', '/signup']);
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/trpc/health'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicRoute =
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);

  // Check for session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;

  // Protected route without session → redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated user visiting login → redirect to app
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/app', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|hero-illustration.png).*)'],
};
