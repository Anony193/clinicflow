/**
 * SOAP Note Schemas (TASK-024, DOC0 §(b).5, Constraints #4/#12)
 *
 * SOAP = Subjective, Objective, Assessment, Plan
 * Constraint #4: SoapNote has optimistic locking (version field)
 * Constraint #12: SoapNote is a PHI entity — every access is logged
 */

import { z } from 'zod';

/** Input for creating a SOAP note */
export const createSoapNoteSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  therapistId: z.string().min(1, 'Therapist is required'),
  appointmentId: z.string().optional().nullable(),
  subjective: z.string().max(10000).optional().nullable(),
  objective: z.string().max(10000).optional().nullable(),
  assessment: z.string().max(10000).optional().nullable(),
  plan: z.string().max(10000).optional().nullable(),
});
export type CreateSoapNoteInput = z.infer<typeof createSoapNoteSchema>;

/** Input for updating a SOAP note (with optimistic locking) */
export const updateSoapNoteSchema = z.object({
  id: z.string(),
  version: z.number().int().min(0),
  subjective: z.string().max(10000).optional().nullable(),
  objective: z.string().max(10000).optional().nullable(),
  assessment: z.string().max(10000).optional().nullable(),
  plan: z.string().max(10000).optional().nullable(),
  status: z.enum(['draft', 'signed', 'amended']).optional(),
});
export type UpdateSoapNoteInput = z.infer<typeof updateSoapNoteSchema>;

/** Input for signing a SOAP note (locks it from further edits) */
export const signSoapNoteSchema = z.object({
  id: z.string(),
  version: z.number().int().min(0),
});

/** Input for listing SOAP notes */
export const listSoapNotesSchema = z.object({
  patientId: z.string().optional(),
  therapistId: z.string().optional(),
  status: z.enum(['draft', 'signed', 'amended']).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
