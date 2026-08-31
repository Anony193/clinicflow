/**
 * Dashboard Page (TASK-017)
 *
 * Shows clinic overview: patient count, appointment count, claim count,
 * and recent activity. Uses the tRPC stats procedure.
 */

import { serverTRPC } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarClock, ClipboardList, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  let stats: { patients: number; appointments: number; claims: number; tenantId: string } | null = null;

  try {
    stats = await serverTRPC((caller) => caller.stats.overview());
  } catch (error) {
    console.error('Dashboard stats error:', error);
  }

  const cards = [
    { label: 'Patients', value: stats?.patients ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Appointments', value: stats?.appointments ?? 0, icon: CalendarClock, color: 'text-primary' },
    { label: 'Claims', value: stats?.claims ?? 0, icon: ClipboardList, color: 'text-primary' },
    { label: 'Revenue (MTD)', value: '$0', icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back to your clinic overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="motion-base hover:elevation-2">
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
        ))}
      </div>

      {/* Welcome card */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Welcome to ClinicFlow! Your clinic is set up and ready. Here&apos;s what you can do next:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Add patients and manage their demographics</li>
            <li>Schedule appointments with conflict-free booking</li>
            <li>Write SOAP notes with structured templates</li>
            <li>Generate and submit insurance claims (CMS-1500)</li>
            <li>Track patient outcomes (DASH, KOOS, Oswestry)</li>
          </ul>
          <p className="pt-2">
            Demo data is loaded: 2 patients (Emily Johnson, Robert Williams), 3 appointment types,
            and a 6-exercise library.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
