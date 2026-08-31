/**
 * Authentication API — Login (TASK-013)
 *
 * DOC1 §7.6 Authentication Flow:
 *   - User submits credentials
 *   - System validates against stored password hash (argon2)
 *   - On success, creates a Session record and returns an opaque session token
 *   - The session token is NOT a JWT (opaque tokens can be revoked instantly)
 *
 * This endpoint:
 *   1. Receives email + password
 *   2. Looks up the user (bypassTenantCheck — no tenant context during login)
 *   3. Verifies the password with argon2
 *   4. Creates a Session record with an opaque token
 *   5. Sets an httpOnly cookie with the session token
 *   6. Returns the user info (without passwordHash)
 *
 * Account lockout (Constraint #7): after 5 failed attempts, lock for 15 minutes.
 */

import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { baseDb } from '@/lib/db';

const SESSION_COOKIE = 'clinicflow-session';
const SESSION_TTL_HOURS = 24;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Look up the user across all tenants (use baseDb — no tenant extension)
    const user = await baseDb.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMin} minute(s).` },
        { status: 423 },
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account has no password set. Use SSO instead.' },
        { status: 401 },
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);

    if (!passwordValid) {
      // Increment failed login count
      const newFailedCount = user.failedLoginCount + 1;
      const shouldLock = newFailedCount >= MAX_FAILED_ATTEMPTS;

      await baseDb.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newFailedCount,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
            : null,
        },
      });

      return NextResponse.json(
        { error: shouldLock ? 'Too many failed attempts. Account locked for 15 minutes.' : 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Success — reset failed login count, update lastLoginAt
    await baseDb.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Create a Session record with an opaque token
    const token = nanoid(48); // opaque, URL-safe, 48 chars
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

    await baseDb.session.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        token,
        expiresAt,
        ip: req.headers.get('x-forwarded-for') ?? null,
        userAgent: req.headers.get('user-agent') ?? null,
      },
    });

    // Set the session cookie (httpOnly, secure in production)
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 },
    );
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
