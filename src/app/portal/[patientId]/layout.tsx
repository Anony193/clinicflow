/**
 * Patient Portal Layout (TASK-038)
 *
 * Separate from the staff app — simpler, patient-focused.
 * No sidebar — just a top bar with the patient name and logout.
 */

import { redirect } from 'next/navigation';
import { resolvePortalSession } from '@/lib/portal-auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Activity, LogOut, CalendarClock, FileText, CreditCard, Dumbbell, MessageSquare, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const req = new Request('http://localhost:3000/portal', { headers: headerList });
  const session = await resolvePortalSession(req);

  if (!session) {
    redirect('/portal/login');
  }

  const navItems = [
    { href: `/portal/${session.patientId}`, label: 'Home', icon: Activity },
    { href: `/portal/${session.patientId}/appointments`, label: 'Appointments', icon: CalendarClock },
    { href: `/portal/${session.patientId}/exercises`, label: 'Exercises', icon: Dumbbell },
    { href: `/portal/${session.patientId}/messaging`, label: 'Messages', icon: MessageSquare },
    { href: `/portal/${session.patientId}/bills`, label: 'Bills', icon: CreditCard },
    { href: `/portal/${session.patientId}/intake`, label: 'Intake', icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 bg-grain">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-prose flex h-14 items-center justify-between">
          <Link href={`/portal/${session.patientId}`} className="flex items-center gap-2 motion-base hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">ClinicFlow Portal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Portal navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground motion-base hover:text-foreground rounded-md"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{session.patientName}</span>
            <form action="/api/portal/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground motion-base hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2" aria-label="Mobile portal nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground motion-base hover:text-foreground"
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <div className="container-prose py-6">
          {children}
        </div>
      </main>

      <footer className="mt-auto border-t border-border bg-background py-4">
        <div className="container-prose text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ClinicFlow Patient Portal · HIPAA-compliant · Secure
        </div>
      </footer>
    </div>
  );
}
