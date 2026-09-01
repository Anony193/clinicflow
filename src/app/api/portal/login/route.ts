/**
 * Patient Portal Login API (TASK-038)
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginPortalPatient, PORTAL_COOKIE } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await loginPortalPatient(email);
    if (!result) {
      return NextResponse.json(
        { error: 'No patient found with that email. Please contact your clinic.' },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      patient: { patientId: result.session.patientId, name: result.session.patientName },
    });

    response.cookies.set(PORTAL_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Portal login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
