import { redirect } from 'next/navigation';
import { resolveSessionFromHeaders } from '@/lib/auth-session';
import { AppShell } from '@/components/app/app-shell';
import { headers } from 'next/headers';

/**
 * Authenticated App Layout (TASK-017)
 *
 * All routes under /app require authentication.
 * If no session, redirect to /login.
 *
 * The layout wraps children in the AppShell (sidebar + topbar).
 */

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const req = new Request('http://localhost:3000/app', {
    headers: headerList,
  });
  const session = await resolveSessionFromHeaders(req);

  if (!session) {
    redirect('/login');
  }

  return <AppShell session={session}>{children}</AppShell>;
}
