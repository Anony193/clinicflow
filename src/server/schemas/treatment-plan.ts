/**
 * Treatment Plan Schemas (TASK-025)
 */

import { z } from 'zod';

export const createTreatmentPlanSchema = z.object({
  patientId: z.string().min(1),
  diagnosis: z.string().max(500).optional().nullable(),
  goals: z.array(z.object({
    description: z.string().min(1),
    targetDate: z.string().datetime().optional().nullable(),
  })).optional().default([]),
  frequency: z.string().max(100).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});
export type CreateTreatmentPlanInput = z.infer<typeof createTreatmentPlanSchema>;

export const updateTreatmentPlanSchema = z.object({
  id: z.string(),
  diagnosis: z.string().max(500).optional().nullable(),
  goals: z.array(z.object({
    description: z.string().min(1),
    targetDate: z.string().datetime().optional().nullable(),
    achieved: z.boolean().optional(),
  })).optional(),
  frequency: z.string().max(100).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

export const listTreatmentPlansSchema = z.object({
  patientId: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
