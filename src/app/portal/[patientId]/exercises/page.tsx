/**
 * Patient Portal — Exercise Program (TASK-041)
 */

import Link from 'next/link';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { baseDb } from '@/lib/db';
import { resolvePortalSession } from '@/lib/portal-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PortalExercisesPage({
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

  const prescriptions = await baseDb.exercisePrescription.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: { exercise: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/portal/${patientId}`}><ArrowLeft className="h-4 w-4" />Back</Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Your Exercise Program
        </h1>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No exercises prescribed yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your therapist will assign exercises at your next visit
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {prescriptions.map((p) => (
            <Card key={p.id} className="elevation-1">
              <CardHeader>
                <CardTitle className="text-md">{p.exercise.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.exercise.description && (
                  <p className="text-sm text-muted-foreground">{p.exercise.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {p.sets && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                      {p.sets} sets
                    </span>
                  )}
                  {p.reps && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                      {p.reps} reps
                    </span>
                  )}
                  {p.holdSec && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
                      {p.holdSec}s hold
                    </span>
                  )}
                  {p.frequency && (
                    <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
                      {p.frequency}
                    </span>
                  )}
                </div>
                {p.notes && (
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Notes: {p.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
