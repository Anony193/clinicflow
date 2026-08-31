/**
 * SOAP Notes Router (TASK-024, DOC0 §(b).5, Constraints #4/#12)
 *
 * Clinical documentation: SOAP notes (Subjective, Objective, Assessment, Plan).
 *
 * Constraint #4: optimistic locking on SoapNote (version field in WHERE)
 * Constraint #12: SoapNote is PHI — every access logged with phi=true
 *
 * Features:
 *   - list — filtered by patient/therapist/status
 *   - get — single note with patient + therapist info
 *   - create — linked to patient + therapist + optional appointment
 *   - update — optimistic-locked, supports autosave (partial updates)
 *   - sign — locks the note from further edits (status: draft → signed)
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { withOptimisticLock } from '@/server/lib/optimistic-lock';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import { TRPCError } from '@trpc/server';
import {
  createSoapNoteSchema,
  updateSoapNoteSchema,
  signSoapNoteSchema,
  listSoapNotesSchema,
} from '@/server/schemas/soap-note';

type SoapNoteRow = {
  id: string;
  version: number;
  patientId: string;
  therapistId: string;
  appointmentId: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  status: string;
  signedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function serializeSoapNote(n: SoapNoteRow) {
  return {
    id: n.id,
    version: n.version,
    patientId: n.patientId,
    therapistId: n.therapistId,
    appointmentId: n.appointmentId,
    subjective: n.subjective,
    objective: n.objective,
    assessment: n.assessment,
    plan: n.plan,
    status: n.status,
    signedAt: n.signedAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export const soapNotesRouter = router({
  /**
   * List SOAP notes — filtered by patient/therapist/status.
   */
  list: protectedProcedure
    .input(listSoapNotesSchema)
    .query(async ({ ctx, input }) => {
      const { patientId, therapistId, status, cursor, limit } = input;

      const notes = await db.soapNote.findMany({
        where: {
          ...(patientId && { patientId }),
          ...(therapistId && { therapistId }),
          ...(status && { status }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          therapist: { select: { name: true } },
        },
      });

      const hasMore = notes.length > limit;
      const items = hasMore ? notes.slice(0, limit) : notes;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'SoapNote',
        entityId: 'list',
        action: 'soap_note.list',
        metadata: { count: items.length },
      });

      return {
        items: items.map((n) => ({
          ...serializeSoapNote(n as unknown as SoapNoteRow),
          patientName: `${n.patient.firstName} ${n.patient.lastName}`,
          therapistName: n.therapist.name,
        })),
        nextCursor,
      };
    }),

  /**
   * Get a single SOAP note by ID.
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await db.soapNote.findUnique({
        where: { id: input.id },
        include: {
          patient: { select: { firstName: true, lastName: true, dateOfBirth: true } },
          therapist: { select: { name: true } },
        },
      });

      if (!note) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SOAP note not found' });
      }

      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'SoapNote',
        entityId: note.id,
        action: 'soap_note.read',
      });

      return {
        ...serializeSoapNote(note as unknown as SoapNoteRow),
        patientName: `${note.patient.firstName} ${note.patient.lastName}`,
        patientDateOfBirth: note.patient.dateOfBirth?.toISOString() ?? null,
        therapistName: note.therapist.name,
      };
    }),

  /**
   * Create a new SOAP note (draft).
   * Idempotent (Constraint #3) — prevents duplicate notes from double-clicks.
   */
  create: idempotentProcedure
    .input(createSoapNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const note = await db.soapNote.create({
        data: {
          patientId: input.patientId,
          therapistId: input.therapistId,
          appointmentId: input.appointmentId ?? null,
          subjective: input.subjective ?? null,
          objective: input.objective ?? null,
          assessment: input.assessment ?? null,
          plan: input.plan ?? null,
          status: 'draft',
        } as Parameters<typeof db.soapNote.create>[0]['data'],
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'soap_note.create',
        entity: 'SoapNote',
        entityId: note.id,
        phi: true,
        metadata: { patientId: input.patientId },
      });

      return serializeSoapNote(note as unknown as SoapNoteRow);
    }),

  /**
   * Update a SOAP note (optimistic locking, Constraint #4).
   * Supports autosave — partial updates with the current version.
   */
  update: protectedProcedure
    .input(updateSoapNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, version, ...patch } = input;

      // If the note is signed, don't allow edits
      const existing = await db.soapNote.findUnique({ where: { id } });
      if (existing?.status === 'signed') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot edit a signed SOAP note. Create an amendment instead.',
        });
      }

      const updated = await withOptimisticLock({
        model: db.soapNote,
        id,
        expectedVersion: version,
        patch: {
          ...(patch.subjective !== undefined && { subjective: patch.subjective ?? null }),
          ...(patch.objective !== undefined && { objective: patch.objective ?? null }),
          ...(patch.assessment !== undefined && { assessment: patch.assessment ?? null }),
          ...(patch.plan !== undefined && { plan: patch.plan ?? null }),
          ...(patch.status && { status: patch.status }),
        },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'soap_note.update',
        entity: 'SoapNote',
        entityId: id,
        phi: true,
        metadata: { version: updated?.version, autosave: true },
      });

      return updated ? serializeSoapNote(updated as unknown as SoapNoteRow) : null;
    }),

  /**
   * Sign a SOAP note — locks it from further edits.
   * Optimistic-locked (Constraint #4).
   */
  sign: protectedProcedure
    .input(signSoapNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const updated = await withOptimisticLock({
        model: db.soapNote,
        id: input.id,
        expectedVersion: input.version,
        patch: {
          status: 'signed',
          signedAt: new Date(),
        },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'soap_note.sign',
        entity: 'SoapNote',
        entityId: input.id,
        phi: true,
        metadata: { signedAt: updated?.signedAt },
      });

      return updated ? serializeSoapNote(updated as unknown as SoapNoteRow) : null;
    }),
});
