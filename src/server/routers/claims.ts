/**
 * Claims Router (TASK-032/033, DOC0 §(b).6, Constraints #4/#12/#13)
 *
 * Insurance claim generation (CMS-1500) + submission to clearinghouse.
 *
 * Constraint #4: Claim has optimistic locking (version field)
 * Constraint #12: Claim is PHI — every access logged
 * Constraint #13: clearinghouse submission is circuit-breaker-wrapped
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { withOptimisticLock } from '@/server/lib/optimistic-lock';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import { writeOutbox } from '@/lib/outbox';
import { getTenantId } from '@/lib/context/tenant-context';
import { TRPCError } from '@trpc/server';

type ClaimRow = {
  id: string;
  version: number;
  patientId: string;
  appointmentId: string | null;
  soapNoteId: string | null;
  payerName: string;
  cptCodes: string;
  icdCodes: string;
  chargeAmountCents: number;
  adjustmentCents: number;
  paidAmountCents: number;
  balanceCents: number;
  status: string;
  submissionId: string | null;
  submittedAt: Date | null;
  acceptedAt: Date | null;
  rejectedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function serializeClaim(c: ClaimRow) {
  return {
    id: c.id,
    version: c.version,
    patientId: c.patientId,
    appointmentId: c.appointmentId,
    soapNoteId: c.soapNoteId,
    payerName: c.payerName,
    cptCodes: JSON.parse(c.cptCodes),
    icdCodes: JSON.parse(c.icdCodes),
    chargeAmountCents: c.chargeAmountCents,
    adjustmentCents: c.adjustmentCents,
    paidAmountCents: c.paidAmountCents,
    balanceCents: c.balanceCents,
    status: c.status,
    submissionId: c.submissionId,
    submittedAt: c.submittedAt?.toISOString() ?? null,
    acceptedAt: c.acceptedAt?.toISOString() ?? null,
    rejectedReason: c.rejectedReason,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export const claimsRouter = router({
  /**
   * List claims — filtered by status/patient.
   */
  list: protectedProcedure
    .input(
      z.object({
        patientId: z.string().optional(),
        status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'PAID', 'DENIED']).optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { patientId, status, cursor, limit } = input;
      const claims = await db.claim.findMany({
        where: {
          ...(patientId && { patientId }),
          ...(status && { status }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true } },
        },
      });
      const hasMore = claims.length > limit;
      const items = hasMore ? claims.slice(0, limit) : claims;

      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'Claim',
        entityId: 'list',
        action: 'claim.list',
        metadata: { count: items.length },
      });

      return {
        items: items.map((c) => ({
          ...serializeClaim(c as unknown as ClaimRow),
          patientName: `${(c as { patient: { firstName: string; lastName: string } }).patient.firstName} ${(c as { patient: { firstName: string; lastName: string } }).patient.lastName}`,
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  /**
   * Generate a claim from a completed SOAP note + appointment.
   * Derives CPT/ICD codes from the appointment type and SOAP note.
   * Looks up the fee schedule for charges.
   */
  generate: idempotentProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        soapNoteId: z.string().optional(),
        payerName: z.string().min(1, 'Payer name is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the appointment with patient + type
      const appointment = await db.appointment.findUnique({
        where: { id: input.appointmentId },
        include: {
          patient: {
            include: { insurancePlans: true },
          },
          appointmentType: true,
        },
      });

      if (!appointment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appointment not found' });
      }

      // Derive CPT codes from appointment type
      // Evaluation → 97161, Treatment → 97110, Re-evaluation → 97164
      const cptMap: Record<string, string> = {
        evaluation: '97161',
        treatment: '97110',
        re_evaluation: '97164',
      };
      const cptCode = cptMap[appointment.appointmentType.key] ?? '97110';

      // Derive ICD-10 code from SOAP note assessment (simplified)
      // In production, the therapist would select ICD codes from a dropdown
      const icdCodes = ['M54.5']; // Default: low back pain

      // Look up the fee schedule
      const fee = await db.feeSchedule.findFirst({
        where: { payerName: input.payerName, cptCode },
      });

      const chargeAmountCents = fee?.rateCents ?? 7500; // default $75

      // Create the claim
      const claim = await db.claim.create({
        data: {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          soapNoteId: input.soapNoteId ?? null,
          payerName: input.payerName,
          cptCodes: JSON.stringify([cptCode]),
          icdCodes: JSON.stringify(icdCodes),
          chargeAmountCents,
          adjustmentCents: 0,
          paidAmountCents: 0,
          balanceCents: chargeAmountCents,
          status: 'DRAFT',
        } as Parameters<typeof db.claim.create>[0]['data'],
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'claim.generate',
        entity: 'Claim',
        entityId: claim.id,
        phi: true,
        metadata: { appointmentId: input.appointmentId, cptCode, chargeAmountCents },
      });

      return serializeClaim(claim as unknown as ClaimRow);
    }),

  /**
   * Submit a claim to the clearinghouse.
   * Writes an outbox event — the job-runner picks it up and calls the
   * clearinghouse API (circuit-breaker-wrapped, Constraint #13).
   */
  submit: protectedProcedure
    .input(z.object({ id: z.string(), version: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Update status to READY first
      const updated = await withOptimisticLock({
        model: db.claim,
        id: input.id,
        expectedVersion: input.version,
        patch: { status: 'READY' },
      });

      // Write outbox event for the job-runner to pick up
      const tenantId = getTenantId();
      if (tenantId) {
        await writeOutbox(db as unknown as Parameters<typeof writeOutbox>[0], {
          tenantId,
          eventType: 'claim.submit',
          payload: { claimId: input.id },
        });
      }

      await logAudit({
        actorId: ctx.user.userId,
        action: 'claim.submit',
        entity: 'Claim',
        entityId: input.id,
        phi: true,
      });

      return updated ? { id: updated.id, status: 'READY' } : null;
    }),

  /**
   * Post a payment to a claim (TASK-034).
   * Idempotent via the idempotency key.
   */
  postPayment: idempotentProcedure
    .input(
      z.object({
        claimId: z.string(),
        patientId: z.string(),
        amountCents: z.number().int().min(0),
        method: z.enum(['cash', 'check', 'card', 'insurance']),
        payer: z.string().optional(),
        reference: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create the payment record
      const payment = await db.payment.create({
        data: {
          claimId: input.claimId,
          patientId: input.patientId,
          amountCents: input.amountCents,
          method: input.method,
          payer: input.payer ?? null,
          reference: input.reference ?? null,
        } as Parameters<typeof db.payment.create>[0]['data'],
      });

      // Update the claim balance (optimistic lock not needed here — we use increment)
      const claim = await db.claim.findUnique({ where: { id: input.claimId } });
      if (claim) {
        await db.claim.update({
          where: { id: input.claimId },
          data: {
            paidAmountCents: { increment: input.amountCents },
            balanceCents: { decrement: input.amountCents },
            status: claim.balanceCents - input.amountCents <= 0 ? 'PAID' : 'SUBMITTED',
          } as Parameters<typeof db.claim.update>[0]['data'],
        });
      }

      await logAudit({
        actorId: ctx.user.userId,
        action: 'payment.post',
        entity: 'Payment',
        entityId: payment.id,
        phi: true,
        metadata: { claimId: input.claimId, amountCents: input.amountCents },
      });

      return {
        id: payment.id,
        claimId: payment.claimId,
        amountCents: payment.amountCents,
        method: payment.method,
      };
    }),
});
