/**
 * Exercises Router (TASK-027, DOC0 §(b).5)
 *
 * Exercise library + prescription + printable handouts.
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import {
  prescribeExerciseSchema,
  listPrescriptionsSchema,
} from '@/server/schemas/exercise';

export const exercisesRouter = router({
  /** List exercises in the library */
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { search, cursor, limit } = input;
      const exercises = await db.exercise.findMany({
        where: {
          active: true,
          ...(search && {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
      });
      const hasMore = exercises.length > limit;
      const items = hasMore ? exercises.slice(0, limit) : exercises;
      return {
        items: items.map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          sets: e.sets,
          reps: e.reps,
          holdSec: e.holdSec,
          equipment: e.equipment,
          imageUrl: e.imageUrl,
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  /** List exercise prescriptions for a patient or treatment plan */
  listPrescriptions: protectedProcedure
    .input(listPrescriptionsSchema)
    .query(async ({ ctx, input }) => {
      const { patientId, treatmentPlanId, cursor, limit } = input;
      const prescriptions = await db.exercisePrescription.findMany({
        where: {
          ...(patientId && { patientId }),
          ...(treatmentPlanId && { treatmentPlanId }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          exercise: true,
          patient: { select: { firstName: true, lastName: true } },
        },
      });
      const hasMore = prescriptions.length > limit;
      const items = hasMore ? prescriptions.slice(0, limit) : prescriptions;

      if (patientId) {
        await logPhiAccess({
          actorId: ctx.user.userId,
          entity: 'ExercisePrescription',
          entityId: 'list',
          action: 'exercise_prescription.list',
          metadata: { patientId, count: items.length },
        });
      }

      return {
        items: items.map((p) => ({
          id: p.id,
          treatmentPlanId: p.treatmentPlanId,
          patientId: p.patientId,
          exerciseId: p.exerciseId,
          exerciseName: p.exercise.name,
          exerciseDescription: p.exercise.description,
          exerciseImageUrl: p.exercise.imageUrl,
          sets: p.sets,
          reps: p.reps,
          holdSec: p.holdSec,
          frequency: p.frequency,
          notes: p.notes,
          patientName: `${p.patient.firstName} ${p.patient.lastName}`,
          createdAt: p.createdAt.toISOString(),
        })),
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };
    }),

  /** Prescribe an exercise to a patient (as part of a treatment plan) */
  prescribe: idempotentProcedure
    .input(prescribeExerciseSchema)
    .mutation(async ({ ctx, input }) => {
      const prescription = await db.exercisePrescription.create({
        data: {
          treatmentPlanId: input.treatmentPlanId,
          exerciseId: input.exerciseId,
          patientId: input.patientId,
          prescribedById: ctx.user.userId,
          sets: input.sets ?? null,
          reps: input.reps ?? null,
          holdSec: input.holdSec ?? null,
          frequency: input.frequency ?? null,
          notes: input.notes ?? null,
        } as Parameters<typeof db.exercisePrescription.create>[0]['data'],
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'exercise.prescribe',
        entity: 'ExercisePrescription',
        entityId: prescription.id,
        phi: true,
        metadata: { patientId: input.patientId, exerciseId: input.exerciseId },
      });

      return {
        id: prescription.id,
        exerciseId: prescription.exerciseId,
        patientId: prescription.patientId,
        sets: prescription.sets,
        reps: prescription.reps,
        holdSec: prescription.holdSec,
        frequency: prescription.frequency,
        notes: prescription.notes,
      };
    }),

  /** Remove a prescription */
  removePrescription: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.exercisePrescription.delete({ where: { id: input.id } });
      await logAudit({
        actorId: ctx.user.userId,
        action: 'exercise_prescription.remove',
        entity: 'ExercisePrescription',
        entityId: input.id,
        phi: true,
      });
      return { ok: true };
    }),
});
