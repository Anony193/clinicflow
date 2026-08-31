/**
 * Patient Detail Page (TASK-019)
 *
 * Server component — fetches patient via the tRPC server caller.
 * Shows patient demographics, insurance, and recent appointments.
 *
 * PHI access is logged by the patients.get procedure (Constraint #12).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, CreditCard } from 'lucide-react';
import { serverTRPC } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let patient;
  try {
    patient = await serverTRPC((caller) => caller.patients.get({ id }));
  } catch {
    notFound();
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="motion-base">
            <Link href="/app/patients">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
              {patient.firstName.charAt(0)}
              {patient.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {patient.status === 'active' ? (
                  <Badge className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">{patient.status}</Badge>
                )}
                {patient.mrn && (
                  <span className="text-xs text-muted-foreground">MRN: {patient.mrn}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Demographics */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Date of Birth</div>
                <div>
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                  {age !== null && <span className="text-muted-foreground ml-2">({age} years)</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div>{patient.email || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div>{patient.phone || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Address</div>
                <div>{patient.address || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Sex</div>
                <div>
                  {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex || '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Insurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.insurancePlans && patient.insurancePlans.length > 0 ? (
              <div className="space-y-3">
                {patient.insurancePlans.map((plan) => (
                  <div key={plan.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plan.payerName}</span>
                      {plan.isPrimary && <Badge className="text-xs">Primary</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      <div>Member ID: {plan.memberId}</div>
                      {plan.groupNumber && <div>Group: {plan.groupNumber}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance on file</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Recent Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.appointments && patient.appointments.length > 0 ? (
            <div className="space-y-2">
              {patient.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {apt.appointmentType?.name ?? 'Appointment'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(apt.startAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(apt.startAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No appointments yet</p>
          )}
        </CardContent>
      </Card>

      {/* Audit info */}
      <div className="text-xs text-muted-foreground text-center pb-4">
        Patient record v{patient.version} · Created{' '}
        {new Date(patient.createdAt).toLocaleDateString()} · Updated{' '}
        {new Date(patient.updatedAt).toLocaleDateString()}
        <br />
        <span className="text-muted-foreground/70">
          All access to this record is logged for HIPAA compliance
        </span>
      </div>
    </div>
  );
}
