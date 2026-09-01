/**
 * Exercise Prescription Schemas (TASK-027)
 */

import { z } from 'zod';

export const prescribeExerciseSchema = z.object({
  treatmentPlanId: z.string().min(1),
  exerciseId: z.string().min(1),
  patientId: z.string().min(1),
  sets: z.number().int().min(1).optional().nullable(),
  reps: z.number().int().min(1).optional().nullable(),
  holdSec: z.number().int().min(1).optional().nullable(),
  frequency: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
export type PrescribeExerciseInput = z.infer<typeof prescribeExerciseSchema>;

export const listPrescriptionsSchema = z.object({
  patientId: z.string().optional(),
  treatmentPlanId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});
