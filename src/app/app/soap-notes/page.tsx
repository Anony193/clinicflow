/**
 * SOAP Notes List Page (TASK-024)
 */

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerTRPC } from '@/lib/trpc/server';

export default async function SoapNotesPage() {
  const caller = await getServerTRPC();

  let notes: Array<{
    id: string;
    status: string;
    patientName: string;
    therapistName: string;
    createdAt: string;
    updatedAt: string;
  }> = [];

  try {
    const result = await caller.run((c) => c.soapNotes.list({ limit: 50 }));
    notes = result.items;
  } catch (error) {
    console.error('SOAP notes error:', error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            SOAP Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clinical documentation — Subjective, Objective, Assessment, Plan
          </p>
        </div>
        <Button asChild className="motion-base gap-2">
          <Link href="/app/patients">
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No SOAP notes yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a patient to create your first clinical note
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <Link key={note.id} href={`/app/soap-notes/${note.id}`}>
              <Card className="motion-base hover:elevation-2 cursor-pointer mb-2">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {note.patientName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {note.therapistName} ·{' '}
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={note.status === 'signed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {note.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
