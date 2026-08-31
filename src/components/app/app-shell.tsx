'use client';

/**
 * App Shell — the authenticated layout (TASK-017)
 *
 * DOC2 §8: Professional UI/UX — no AI-flag work.
 * Sidebar nav + topbar + main content area + sticky footer.
 *
 * Role-based nav visibility (DOC0 §(b).2):
 *   OWNER: all nav items
 *   THERAPIST: patients, schedule, SOAP notes, exercises
 *   FRONT_DESK: patients, schedule
 *   BILLING_MANAGER: billing, claims, reports
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  CalendarClock,
  FileText,
  CreditCard,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Session } from '@/lib/auth-session';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
  roles: string[]; // which roles can see this
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: Activity, roles: ['OWNER', 'THERAPIST', 'FRONT_DESK', 'BILLING_MANAGER'] },
  { href: '/app/patients', label: 'Patients', icon: Users, roles: ['OWNER', 'THERAPIST', 'FRONT_DESK'] },
  { href: '/app/schedule', label: 'Schedule', icon: CalendarClock, roles: ['OWNER', 'THERAPIST', 'FRONT_DESK'] },
  { href: '/app/soap-notes', label: 'SOAP Notes', icon: FileText, roles: ['OWNER', 'THERAPIST'] },
  { href: '/app/billing', label: 'Billing', icon: CreditCard, roles: ['OWNER', 'BILLING_MANAGER'] },
  { href: '/app/claims', label: 'Claims', icon: ClipboardList, roles: ['OWNER', 'BILLING_MANAGER'] },
  { href: '/app/reports', label: 'Reports', icon: BarChart3, roles: ['OWNER', 'BILLING_MANAGER'] },
  { href: '/app/settings', label: 'Settings', icon: Settings, roles: ['OWNER'] },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Clinic Owner',
  THERAPIST: 'Therapist',
  FRONT_DESK: 'Front Desk',
  BILLING_MANAGER: 'Billing Manager',
  PATIENT: 'Patient',
};

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(session.role));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground motion-base hover:bg-muted"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/app" className="flex items-center gap-2 motion-base hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight hidden sm:block">ClinicFlow</span>
          </Link>
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 motion-base hover:bg-muted">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium leading-none">{session.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-0.5">
                  {ROLE_LABELS[session.role] ?? session.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{session.name}</span>
                <span className="text-muted-foreground">{session.email}</span>
                <Badge variant="outline" className="mt-1 w-fit text-xs">
                  {ROLE_LABELS[session.role] ?? session.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="cursor-pointer text-sm">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed md:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-sidebar transition-transform motion-base md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="flex flex-col gap-1 p-3" aria-label="Sidebar">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm motion-base',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 z-20 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container-prose py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-border bg-muted/30 py-4">
        <div className="container-prose flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ClinicFlow · HIPAA-compliant</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
