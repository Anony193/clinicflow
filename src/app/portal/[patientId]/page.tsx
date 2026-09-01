/**
 * Patient Portal Home (TASK-038)
 *
 * Shows the patient their upcoming appointment, recent exercises, and outstanding balance.
 */

import Link from 'next/link';
import { CalendarClock, Dumbbell, CreditCard, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resolvePortalSession } from '@/lib/portal-auth';
import { baseDb } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PortalHomePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  // Verify the portal session matches this patient
  const headerList = await headers();
  const req = new Request('http://localhost:3000/portal', { headers: headerList });
  const session = await resolvePortalSession(req);

  if (!session || session.patientId !== patientId) {
    redirect('/portal/login');
  }

  // Fetch patient data using baseDb + manual tenant filter
  const patient = await baseDb.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        where: { startAt: { gte: new Date() }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
        take: 1,
        orderBy: { startAt: 'asc' },
        include: { appointmentType: true, therapist: { select: { name: true } } },
      },
      exercisePrescriptions: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { exercise: true },
      },
      claims: {
        where: { balanceCents: { gt: 0 } },
        select: { balanceCents: true, payerName: true },
      },
    },
  });

  if (!patient) {
    redirect('/portal/login');
  }

  const upcomingAppointment = patient.appointments[0];
  const outstandingBalance = patient.claims.reduce((sum, c) => sum + c.balanceCents, 0);
  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Welcome, {patient.firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your appointments, exercises, and bills
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming appointment */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointment ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {upcomingAppointment.appointmentType.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(upcomingAppointment.startAt).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })} at{' '}
                  {new Date(upcomingAppointment.startAt).toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit',
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  with {upcomingAppointment.therapist.name}
                </div>
                <Button asChild size="sm" variant="outline" className="motion-base mt-2 gap-2">
                  <Link href={`/portal/${patientId}/appointments`}>
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Button asChild size="sm" className="motion-base gap-2">
                  <Link href={`/portal/${patientId}/appointments`}>
                    <CalendarClock className="h-3 w-3" />
                    Book an appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding balance */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outstandingBalance > 0 ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
                <p className="text-xs text-muted-foreground">
                  {patient.claims.length} claim{patient.claims.length !== 1 ? 's' : ''} with balance
                </p>
                <Button asChild size="sm" className="motion-base mt-2 gap-2">
                  <Link href={`/portal/${patientId}/bills`}>
                    Pay now
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>No outstanding balance</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise program */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Your Exercise Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.exercisePrescriptions.length > 0 ? (
              <div className="space-y-2">
                {patient.exercisePrescriptions.map((p) => (
                  <div key={p.id} className="text-sm">
                    <span className="font-medium">{p.exercise.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {p.sets && `${p.sets} sets × `}
                      {p.reps && `${p.reps} reps`}
                      {p.holdSec && ` (${p.holdSec}s hold)`}
                    </span>
                  </div>
                ))}
                <Button asChild size="sm" variant="outline" className="motion-base mt-2 gap-2">
                  <Link href={`/portal/${patientId}/exercises`}>
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No exercises prescribed yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent documents */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your clinical notes and intake forms will appear here.
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              Coming soon
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
