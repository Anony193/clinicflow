/**
 * Outcome Measure Schemas (TASK-026, DOC0 §(b).5)
 *
 * PT outcome measures: DASH (30 items), Oswestry (10 sections), KOOS (42 items).
 * Each produces a 0-100 score (higher = more disability for DASH/Oswestry;
 * higher = better function for KOOS).
 */

import { z } from 'zod';

export const outcomeMeasureTypeSchema = z.enum(['DASH', 'Oswestry', 'KOOS', 'QuickDASH', 'NRS']);

export const recordOutcomeMeasureSchema = z.object({
  patientId: z.string().min(1),
  type: outcomeMeasureTypeSchema,
  responses: z.record(z.string(), z.number()),
  takenAt: z.string().datetime(),
});
export type RecordOutcomeMeasureInput = z.infer<typeof recordOutcomeMeasureSchema>;

export const listOutcomeMeasuresSchema = z.object({
  patientId: z.string(),
  type: outcomeMeasureTypeSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const trendOutcomeMeasuresSchema = z.object({
  patientId: z.string(),
  type: outcomeMeasureTypeSchema,
});
