'use client';

/**
 * Appointment Booking Form (TASK-021)
 *
 * The CRITICAL concurrency UI (Constraint #5):
 * - Select patient, therapist, appointment type
 * - Pick a date → see available slots
 * - Click a slot → book (uses distributed lock + idempotency)
 *
 * If two users try to book the same slot simultaneously, the distributed
 * lock ensures only one succeeds; the other gets SLOT_TAKEN.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BookingForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [patientId, setPatientId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [appointmentTypeId, setAppointmentTypeId] = useState('');
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Fetch patients, therapists, appointment types, rooms
  const patients = trpc.patients.list.useQuery({ limit: 100 });
  const types = trpc.appointments.types.useQuery();
  const rooms = trpc.appointments.rooms.useQuery();
  const therapists = trpc.appointments.therapists.useQuery();

  // Fetch available slots when therapist + type + date are selected
  const slots = trpc.appointments.getAvailableSlots.useQuery(
    {
      therapistId,
      appointmentTypeId,
      date: date ? new Date(date + 'T00:00:00').toISOString() : '',
    },
    { enabled: !!therapistId && !!appointmentTypeId && !!date },
  );

  const bookMutation = trpc.appointments.book.useMutation({
    onSuccess: (data) => {
      toast.success('Appointment booked successfully');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/app/schedule');
    },
    onError: (error) => {
      if (error.message.includes('SLOT_TAKEN')) {
        toast.error('This slot was just booked by someone else. Please choose another.');
      } else if (error.message.includes('SLOT_BEING_BOOKED')) {
        toast.error('Another user is booking this slot. Please try again in a moment.');
      } else {
        toast.error(`Failed to book: ${error.message}`);
      }
    },
  });

  function handleBook(slotStart: string, slotEnd: string) {
    if (!patientId || !therapistId || !appointmentTypeId) {
      toast.error('Please select a patient, therapist, and appointment type first');
      return;
    }

    setSelectedSlot(slotStart);
    bookMutation.mutate({
      patientId,
      therapistId,
      appointmentTypeId,
      startAt: slotStart,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1: Select patient, therapist, type */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">1. Select Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Patient *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="motion-base">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.data?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Therapist *</Label>
              <Select value={therapistId} onValueChange={setTherapistId}>
                <SelectTrigger className="motion-base">
                  <SelectValue placeholder="Select therapist..." />
                </SelectTrigger>
                <SelectContent>
                  {therapists.data?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Appointment Type *</Label>
              <Select value={appointmentTypeId} onValueChange={setAppointmentTypeId}>
                <SelectTrigger className="motion-base">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {types.data?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.durationMin} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="motion-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select a slot */}
      {therapistId && appointmentTypeId && date && (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              2. Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : slots.data && slots.data.slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.data.slots.map((slot) => (
                  <button
                    key={slot.startAt}
                    disabled={!slot.available || (bookMutation.isPending && selectedSlot === slot.startAt)}
                    onClick={() => handleBook(slot.startAt, slot.endAt)}
                    className={cn(
                      'rounded-md border px-3 py-2 text-sm motion-base text-center',
                      slot.available
                        ? 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                        : 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed line-through',
                    )}
                  >
                    {new Date(slot.startAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {bookMutation.isPending && selectedSlot === slot.startAt && (
                      <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No available slots on this date. The therapist may not have availability set.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {bookMutation.isSuccess && (
        <Card className="elevation-2 border-green-500/30">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Appointment booked!</p>
              <p className="text-xs text-muted-foreground">Redirecting to schedule...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
