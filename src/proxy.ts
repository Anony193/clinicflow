/**
 * Next.js Middleware — Routing-level auth check (TASK-006 placeholder)
 *
 * TASK-013 will implement the real NextAuth session check here.
 * For now, this is a passthrough that allows all routes.
 *
 * In production (DOC1 §7.6), the middleware will:
 *   1. Check for a session cookie on protected routes
 *   2. Redirect to /login if not authenticated
 *   3. Allow public routes (/ , /login, /api/auth/*, /api/trpc/health)
 *
 * NOTE: The actual tenant context (AsyncLocalStorage) is set in the
 * tRPC API route handler, NOT here — because middleware runs on the
 * Edge runtime and can't use Prisma or AsyncLocalStorage.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = new Set(['/', '/login', '/signup']);
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/trpc/health'];

export function proxy(_req: NextRequest) {
  // TODO: TASK-013 — implement real auth routing
  // const sessionToken = req.cookies.get('next-auth.session-token');
  // const isPublicRoute = PUBLIC_ROUTES.has(req.nextUrl.pathname) ||
  //   PUBLIC_API_PREFIXES.some(p => req.nextUrl.pathname.startsWith(p));
  // if (!sessionToken && !isPublicRoute) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|hero-illustration.png).*)'],
};
