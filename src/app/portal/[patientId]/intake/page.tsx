'use client';

/**
 * Portal Intake Form Page (TASK-041)
 */

import { useState } from 'react';
import { ClipboardList, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PortalIntakePage({ params }: { params: { patientId: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    medications: '',
    surgicalHistory: '',
    chiefComplaint: '',
    painLevel: '5',
    goals: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production: trpc.intakeForms.submit.mutate(formData)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Intake form submitted successfully');
    }, 1000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/portal/${params.patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Intake Form
          </h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-sm font-medium">Thank you! Your intake form has been submitted.</p>
            <p className="text-xs text-muted-foreground mt-1">Your therapist will review it before your appointment.</p>
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
          <Link href={`/portal/${params.patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Patient Intake Form
        </h1>
      </div>

      <Card className="elevation-1">
        <CardHeader><CardTitle className="text-md">Medical History & Consent</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Emergency Contact Name</Label>
                <Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} className="motion-base" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Emergency Contact Phone</Label>
                <Input value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} className="motion-base" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Allergies</Label>
              <Textarea value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="List any allergies..." className="motion-base" />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Current Medications</Label>
              <Textarea value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} placeholder="List current medications..." className="motion-base" />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Surgical History</Label>
              <Textarea value={formData.surgicalHistory} onChange={(e) => setFormData({ ...formData, surgicalHistory: e.target.value })} placeholder="List any relevant surgeries..." className="motion-base" />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Chief Complaint (what brings you in?)</Label>
              <Textarea value={formData.chiefComplaint} onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })} placeholder="Describe your main concern..." className="motion-base" />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Current Pain Level (0-10): {formData.painLevel}</Label>
              <input type="range" min="0" max="10" value={formData.painLevel} onChange={(e) => setFormData({ ...formData, painLevel: e.target.value })} className="w-full" />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Treatment Goals</Label>
              <Textarea value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} placeholder="What do you hope to achieve?" className="motion-base" />
            </div>

            <Button type="submit" disabled={loading} className="motion-base gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : 'Submit Intake Form'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
