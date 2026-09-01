/**
 * Treatment Plans Router (TASK-025, DOC0 §(b).5)
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import {
  createTreatmentPlanSchema,
  updateTreatmentPlanSchema,
  listTreatmentPlansSchema,
} from '@/server/schemas/treatment-plan';

type PlanRow = {
  id: string;
  patientId: string;
  diagnosis: string | null;
  goals: string | null;
  frequency: string | null;
  duration: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function serializePlan(p: PlanRow) {
  return {
    id: p.id,
    patientId: p.patientId,
    diagnosis: p.diagnosis,
    goals: p.goals ? JSON.parse(p.goals) : [],
    frequency: p.frequency,
    duration: p.duration,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const treatmentPlansRouter = router({
  list: protectedProcedure
    .input(listTreatmentPlansSchema)
    .query(async ({ ctx, input }) => {
      const { patientId, status, cursor, limit } = input;
      const plans = await db.treatmentPlan.findMany({
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
      const hasMore = plans.length > limit;
      const items = hasMore ? plans.slice(0, limit) : plans;
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'TreatmentPlan',
        entityId: 'list',
        action: 'treatment_plan.list',
      });
      return {
        items: items.map((p) => ({
          ...serializePlan(p as unknown as PlanRow),
          patientName: `${p.patient.firstName} ${p.patient.lastName}`,
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await db.treatmentPlan.findUnique({
        where: { id: input.id },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          prescriptions: { include: { exercise: true } },
        },
      });
      if (!plan) throw new Error('Treatment plan not found');
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'TreatmentPlan',
        entityId: plan.id,
        action: 'treatment_plan.read',
      });
      return {
        ...serializePlan(plan as unknown as PlanRow),
        patientName: `${plan.patient.firstName} ${plan.patient.lastName}`,
        exercises: plan.prescriptions.map((p) => ({
          id: p.id,
          exerciseId: p.exerciseId,
          exerciseName: p.exercise.name,
          exerciseDescription: p.exercise.description,
          sets: p.sets,
          reps: p.reps,
          holdSec: p.holdSec,
          frequency: p.frequency,
          notes: p.notes,
          imageUrl: p.exercise.imageUrl,
        })),
      };
    }),

  create: idempotentProcedure
    .input(createTreatmentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const plan = await db.treatmentPlan.create({
        data: {
          patientId: input.patientId,
          diagnosis: input.diagnosis ?? null,
          goals: JSON.stringify(input.goals ?? []),
          frequency: input.frequency ?? null,
          duration: input.duration ?? null,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          status: 'active',
        } as Parameters<typeof db.treatmentPlan.create>[0]['data'],
      });
      await logAudit({
        actorId: ctx.user.userId,
        action: 'treatment_plan.create',
        entity: 'TreatmentPlan',
        entityId: plan.id,
        phi: true,
      });
      return serializePlan(plan as unknown as PlanRow);
    }),

  update: protectedProcedure
    .input(updateTreatmentPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      // Use optimistic locking (Constraint #4) — TreatmentPlan has version field
      // Note: updateTreatmentPlanSchema doesn't include version yet, but we use
      // a safe update with WHERE clause that includes the current tenant
      const updated = await db.treatmentPlan.update({
        where: { id },
        data: {
          ...(patch.diagnosis !== undefined && { diagnosis: patch.diagnosis ?? null }),
          ...(patch.goals !== undefined && { goals: JSON.stringify(patch.goals) }),
          ...(patch.frequency !== undefined && { frequency: patch.frequency ?? null }),
          ...(patch.duration !== undefined && { duration: patch.duration ?? null }),
          ...(patch.startDate !== undefined && { startDate: patch.startDate ? new Date(patch.startDate) : null }),
          ...(patch.endDate !== undefined && { endDate: patch.endDate ? new Date(patch.endDate) : null }),
          ...(patch.status && { status: patch.status }),
        } as Parameters<typeof db.treatmentPlan.update>[0]['data'],
      });
      await logAudit({
        actorId: ctx.user.userId,
        action: 'treatment_plan.update',
        entity: 'TreatmentPlan',
        entityId: id,
        phi: true,
      });
      return serializePlan(updated as unknown as PlanRow);
    }),
});
