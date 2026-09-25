'use client';

/**
 * Patient Portal — Request Appointment (TASK-038)
 * Patients can request an appointment (simplified booking flow).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarClock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function RequestAppointmentPage({ params }: { params: { patientId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production: call API to create appointment request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Appointment request submitted! Your clinic will contact you to confirm.');
    }, 1000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/portal/${params.patientId}/appointments`}>
              <ArrowLeft className="h-4 w-4" />Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Request Appointment
          </h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-sm font-medium">Your request has been submitted!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your clinic will contact you within 24 hours to confirm your appointment.
            </p>
            <Button asChild variant="outline" className="mt-4 motion-base">
              <Link href={`/portal/${params.patientId}`}>Back to Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portal/${params.patientId}/appointments`}>
            <ArrowLeft className="h-4 w-4" />Back
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Request Appointment
        </h1>
      </div>

      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Appointment Type</Label>
              <Select value={formData.appointmentType} onValueChange={(v) => setFormData({ ...formData, appointmentType: v })}>
                <SelectTrigger className="motion-base">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evaluation">Initial Evaluation</SelectItem>
                  <SelectItem value="treatment">Treatment Visit</SelectItem>
                  <SelectItem value="re_evaluation">Re-Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Preferred Date</Label>
                <Input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  required
                  className="motion-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Preferred Time</Label>
                <Input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  required
                  className="motion-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Notes (optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any details about your visit..."
                className="motion-base"
              />
            </div>

            <Button type="submit" disabled={loading} className="motion-base gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
