/**
 * Patient Schemas (TASK-019, DOC3 §8)
 *
 * Zod schemas serve as both the runtime validator AND the TypeScript type
 * (single source of truth). The tRPC procedure uses these for input/output
 * validation, and the frontend infers types from them — zero codegen.
 *
 * Constraint #4: Patient has optimistic locking (version field).
 * Constraint #12: Patient is a PHI entity — every access is logged.
 */

import { z } from 'zod';

/** Patient status enum */
export const patientStatusSchema = z.enum(['active', 'inactive', 'archived']);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

/** Sex enum (optional) */
export const sexSchema = z.enum(['M', 'F', 'O']).optional();

/** Input for creating a patient */
export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().datetime().optional().nullish(),
  email: z.string().email('Invalid email').optional().nullish(),
  phone: z.string().max(30).optional().nullish(),
  address: z.string().max(500).optional().nullish(),
  sex: sexSchema,
  mrn: z.string().max(50).optional().nullish(),
  medicalHistory: z.record(z.string(), z.unknown()).optional().nullish(),
});
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

/** Input for updating a patient (with optimistic locking) */
export const updatePatientSchema = z.object({
  id: z.string(),
  version: z.number().int().min(0, 'Version is required for optimistic locking'),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().datetime().optional().nullish(),
  email: z.string().email().optional().nullish(),
  phone: z.string().max(30).optional().nullish(),
  address: z.string().max(500).optional().nullish(),
  sex: sexSchema,
  mrn: z.string().max(50).optional().nullish(),
  status: patientStatusSchema.optional(),
  medicalHistory: z.record(z.string(), z.unknown()).optional().nullish(),
});
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

/** Input for listing patients (cursor pagination, DOC3 §9.2) */
export const listPatientsSchema = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(), // cursor = last patient's id
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListPatientsInput = z.infer<typeof listPatientsSchema>;

/** Patient output shape (excludes sensitive fields if needed) */
export const patientOutputSchema = z.object({
  id: z.string(),
  version: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string().datetime().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  sex: z.string().nullable(),
  mrn: z.string().nullable(),
  status: z.string(),
  medicalHistory: z.unknown().nullable(),
  consentFormUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PatientOutput = z.infer<typeof patientOutputSchema>;

/** Paginated list output (DOC3 §9.2 cursor pagination) */
export const patientListOutputSchema = z.object({
  items: z.array(patientOutputSchema),
  nextCursor: z.string().nullable(),
});
export type PatientListOutput = z.infer<typeof patientListOutputSchema>;
