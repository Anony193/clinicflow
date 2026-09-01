/**
 * Reports Page (TASK-042, DOC0 §(b).8)
 *
 * Server component — fetches all report data via serverTRPC,
 * passes to client component for chart rendering.
 */

import { BarChart3, TrendingUp, DollarSign, CalendarClock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsCharts } from '@/components/reports/reports-charts';
import { serverTRPC } from '@/lib/trpc/server';

export default async function ReportsPage() {
  let perf: { visitsThisMonth: number; completedVisits: number; noShows: number; noShowRate: number; totalChargesCents: number; totalCollectedCents: number; outstandingBalanceCents: number; claimCount: number; paymentCount: number } | null = null;
  let productivity: { therapists: Array<{ therapistId: string; therapistName: string; visitCount: number; completedCount: number; soapNoteCount: number }> } | null = null;
  let claimStatus: { statuses: Array<{ status: string; count: number; totalChargesCents: number; totalPaidCents: number; totalBalanceCents: number }> } | null = null;
  let outcomes: { measures: Array<{ type: string; count: number; avgScore: number; avgPercent: number; minScore: number; maxScore: number }> } | null = null;

  try {
    perf = await serverTRPC((c) => c.reports.clinicPerformance({}));
    productivity = await serverTRPC((c) => c.reports.therapistProductivity());
    claimStatus = await serverTRPC((c) => c.reports.claimStatus());
    outcomes = await serverTRPC((c) => c.reports.patientOutcomes({}));
  } catch (error) {
    console.error('Reports error:', error);
  }

  if (!perf || !productivity || !claimStatus || !outcomes) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Reports
        </h1>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Unable to load reports. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const statCards = [
    { label: 'Visits This Month', value: perf.visitsThisMonth, icon: CalendarClock, color: 'text-primary' },
    { label: 'Completed', value: perf.completedVisits, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'No-Show Rate', value: `${perf.noShowRate}%`, icon: AlertCircle, color: 'text-amber-600' },
    { label: 'Total Charges', value: formatCurrency(perf.totalChargesCents), icon: DollarSign, color: 'text-primary' },
    { label: 'Collected', value: formatCurrency(perf.totalCollectedCents), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Outstanding', value: formatCurrency(perf.outstandingBalanceCents), icon: AlertCircle, color: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clinic performance, therapist productivity, and patient outcomes
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <Card key={card.label} className="elevation-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts (client component) */}
      <ReportsCharts productivity={productivity} claimStatus={claimStatus} outcomes={outcomes} />
    </div>
  );
}
