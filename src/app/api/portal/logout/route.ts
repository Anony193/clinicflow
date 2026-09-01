/**
 * Patient Portal Logout API (TASK-038)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_COOKIE } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PORTAL_COOKIE);
  return response;
}
