/**
 * Appointment Schemas (TASK-020/021, DOC0 §(b).4, Constraints #3/#4/#5)
 *
 * Zod schemas for appointment types, availability, and booking.
 * Constraint #3: booking is idempotent (Idempotency-Key header)
 * Constraint #4: Appointment has optimistic locking (version field)
 * Constraint #5: booking uses a distributed lock (Redis SET NX)
 */

import { z } from 'zod';

/** Appointment status enum (DOC0 §(b).4) */
export const appointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'ARRIVED',
  'IN_SESSION',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
]);

/** Input for listing appointments */
export const listAppointmentsSchema = z.object({
  date: z.string().datetime().optional(), // filter to a specific day
  patientId: z.string().optional(),
  therapistId: z.string().optional(),
  status: appointmentStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

/** Input for booking an appointment (TASK-021 — CRITICAL) */
export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  therapistId: z.string().min(1, 'Therapist is required'),
  appointmentTypeId: z.string().min(1, 'Appointment type is required'),
  roomId: z.string().optional().nullable(),
  startAt: z.string().datetime('Invalid start time'),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

/** Input for updating an appointment (optimistic locking) */
export const updateAppointmentSchema = z.object({
  id: z.string(),
  version: z.number().int().min(0),
  status: appointmentStatusSchema.optional(),
  roomId: z.string().optional().nullable(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

/** Input for cancelling an appointment */
export const cancelAppointmentSchema = z.object({
  id: z.string(),
  version: z.number().int().min(0),
  reason: z.string().max(500).optional(),
});

/** Available slots query */
export const getAvailableSlotsSchema = z.object({
  therapistId: z.string(),
  appointmentTypeId: z.string(),
  date: z.string().datetime(), // the day to check
});

/** Slot output */
export const slotOutputSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  available: z.boolean(),
});

/** Appointment output */
export const appointmentOutputSchema = z.object({
  id: z.string(),
  version: z.number(),
  patientId: z.string(),
  therapistId: z.string(),
  appointmentTypeId: z.string(),
  roomId: z.string().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  status: z.string(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  patientName: z.string().optional(),
  therapistName: z.string().optional(),
  typeName: z.string().optional(),
  durationMin: z.number().optional(),
});
