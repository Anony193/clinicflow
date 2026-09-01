/**
 * Patient Portal — Appointments (TASK-038)
 */

import Link from 'next/link';
import { CalendarClock, ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { baseDb } from '@/lib/db';
import { resolvePortalSession } from '@/lib/portal-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PortalAppointmentsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const headerList = await headers();
  const req = new Request('http://localhost:3000', { headers: headerList });
  const session = await resolvePortalSession(req);

  if (!session || session.patientId !== patientId) {
    redirect('/portal/login');
  }

  const appointments = await baseDb.appointment.findMany({
    where: { patientId },
    orderBy: { startAt: 'desc' },
    take: 20,
    include: { appointmentType: true, therapist: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portal/${patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Appointments
        </h1>
      </div>

      <Card className="elevation-1 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium">Need to schedule?</p>
            <p className="text-xs text-muted-foreground">Call your clinic or request online</p>
          </div>
          <Button asChild size="sm" className="motion-base gap-2">
            <Link href={`/portal/${patientId}/appointments/new`}>
              <Plus className="h-3 w-3" />Request
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-md">Appointment History</CardTitle></CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No appointments yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">
                        {new Date(apt.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(apt.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{apt.appointmentType.name}</div>
                      <div className="text-xs text-muted-foreground">with {apt.therapist.name}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{apt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
