/**
 * SOAP Note Detail Page (TASK-024)
 *
 * Server component — fetches the SOAP note via the tRPC server caller,
 * then renders the client-side editor component.
 *
 * PHI access is logged by the soapNotes.get procedure (Constraint #12).
 */

import { notFound } from 'next/navigation';
import { serverTRPC } from '@/lib/trpc/server';
import { SoapNoteEditor } from '@/components/soap-notes/soap-note-editor';

export default async function SoapNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let note;
  try {
    note = await serverTRPC((caller) => caller.soapNotes.get({ id }));
  } catch {
    notFound();
  }

  return <SoapNoteEditor note={note} />;
}
