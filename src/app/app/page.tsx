/**
 * Dashboard Page (TASK-017)
 *
 * Clean, data-driven clinic overview with stats cards + quick actions.
 */

import Link from 'next/link';
import { serverTRPC } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarClock, ClipboardList, TrendingUp, Plus, FileText, BarChart3, CreditCard, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  let stats: { patients: number; appointments: number; claims: number; tenantId: string } | null = null;
  let perf: { visitsThisMonth: number; completedVisits: number; noShows: number; noShowRate: number; totalChargesCents: number; totalCollectedCents: number; outstandingBalanceCents: number } | null = null;

  try {
    stats = await serverTRPC((caller) => caller.stats.overview());
    perf = await serverTRPC((caller) => caller.reports.clinicPerformance({}));
  } catch (error) {
    console.error('Dashboard error:', error);
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const cards = [
    { label: 'Patients', value: stats?.patients ?? 0, icon: Users, href: '/app/patients', color: 'text-teal-600' },
    { label: 'Appointments', value: stats?.appointments ?? 0, icon: CalendarClock, href: '/app/schedule', color: 'text-cyan-600' },
    { label: 'Claims', value: stats?.claims ?? 0, icon: ClipboardList, href: '/app/claims', color: 'text-violet-600' },
    { label: 'Collected', value: formatCurrency(perf?.totalCollectedCents ?? 0), icon: TrendingUp, href: '/app/billing', color: 'text-emerald-600' },
  ];

  const quickActions = [
    { label: 'New Patient', href: '/app/patients/new', icon: Plus, desc: 'Add a patient to your clinic' },
    { label: 'Schedule', href: '/app/schedule', icon: CalendarClock, desc: 'Book an appointment' },
    { label: 'SOAP Note', href: '/app/soap-notes', icon: FileText, desc: 'Write clinical documentation' },
    { label: 'Reports', href: '/app/reports', icon: BarChart3, desc: 'View clinic analytics' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clinic overview for this month
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="motion-base hover:elevation-2 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="motion-base hover:elevation-2 cursor-pointer h-full">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{action.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{action.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Financial summary */}
      {perf && (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Total Charges</div>
                <div className="text-lg font-bold">{formatCurrency(perf.totalChargesCents)}</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="text-xs text-muted-foreground">Collected</div>
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(perf.totalCollectedCents)}</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <div className="text-xs text-muted-foreground">Outstanding</div>
                <div className="text-lg font-bold text-amber-600">{formatCurrency(perf.outstandingBalanceCents)}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{perf.visitsThisMonth} visits this month</span>
              <span>·</span>
              <span>{perf.completedVisits} completed</span>
              <span>·</span>
              <span>{perf.noShowRate}% no-show rate</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
