/**
 * Schedule Page (TASK-021)
 *
 * Shows today's appointments + a booking form.
 */

import { CalendarClock, Plus } from 'lucide-react';
import { getServerTRPC } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingForm } from '@/components/schedule/booking-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SchedulePage() {
  const caller = await getServerTRPC();

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let appointments: Array<{
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    patientName?: string;
    therapistName?: string;
    typeName?: string;
    durationMin?: number;
  }> = [];

  try {
    const result = await caller.run((c) =>
      c.appointments.list({ date: today.toISOString(), limit: 50 }),
    );
    appointments = result.items;
  } catch (error) {
    console.error('Schedule error:', error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="motion-base gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
            </DialogHeader>
            <BookingForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's appointments */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No appointments today</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "New Appointment" to book one
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {appointments.map((apt) => (
                <Link key={apt.id} href={`/app/patients`}>
                  <Card className="motion-base hover:elevation-2 cursor-pointer mb-2">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">
                            {new Date(apt.startAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {apt.durationMin}min
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{apt.patientName}</div>
                          <div className="text-xs text-muted-foreground">
                            {apt.typeName} · {apt.therapistName}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {apt.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
