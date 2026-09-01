/**
 * Appointments Router (TASK-020/021, DOC0 §(b).4, Constraints #3/#4/#5/#10)
 *
 * THE CRITICAL CONCURRENCY TASK (Constraint #5):
 * Appointment booking MUST use a distributed lock (Redis SET NX with TTL)
 * to prevent double-booking the same slot.
 *
 * Booking flow (DOC5 §6.3 + DOC5 §6.4):
 *   1. Acquire distributed lock: lock.acquire('appt:slot:{therapistId}:{start}', 30s)
 *   2. Check for conflicting appointments (same therapist + overlapping time)
 *   3. Create Appointment with idempotency key (Constraint #3)
 *   4. Write outbox event 'appointment.booked' (for reminders)
 *   5. Release lock
 *   6. Log PHI audit (Constraint #12 — Appointment is linked to Patient = PHI)
 *
 * If two patients try to book the same slot simultaneously:
 *   - Patient A acquires the lock → checks for conflicts → creates appointment
 *   - Patient B fails to acquire the lock → returns SLOT_TAKEN error
 *   - OR Patient B waits, then checks and finds the conflict → returns SLOT_TAKEN
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { lock } from '@/lib/ports/lock-index';
import { withOptimisticLock } from '@/server/lib/optimistic-lock';
import { logAudit, logPhiAccess } from '@/server/lib/audit';
import { writeOutbox } from '@/lib/outbox';
import { getTenantId } from '@/lib/context/tenant-context';
import { TRPCError } from '@trpc/server';
import {
  listAppointmentsSchema,
  bookAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  getAvailableSlotsSchema,
} from '@/server/schemas/appointment';

/** Lock TTL for appointment booking: 30 seconds (DOC0 §(g)) */
const BOOKING_LOCK_TTL_MS = 30_000;

export const appointmentsRouter = router({
  /**
   * List appointments — filtered by date/patient/therapist/status.
   * Includes patient name, therapist name, and appointment type name.
   */
  list: protectedProcedure
    .input(listAppointmentsSchema)
    .query(async ({ ctx, input }) => {
      const { date, patientId, therapistId, status, cursor, limit } = input;

      // Build date filter (if date provided, filter to that day)
      const dateFilter = date
        ? {
            startAt: {
              gte: new Date(date),
              lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
            },
          }
        : {};

      const appointments = await db.appointment.findMany({
        where: {
          ...dateFilter,
          ...(patientId && { patientId }),
          ...(therapistId && { therapistId }),
          ...(status && { status }),
          status: { not: 'CANCELLED' },
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { startAt: 'asc' },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          therapist: { select: { name: true } },
          appointmentType: { select: { name: true, durationMin: true, color: true } },
        },
      });

      const hasMore = appointments.length > limit;
      const items = hasMore ? appointments.slice(0, limit) : appointments;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      // Log PHI access (appointments reference patient data)
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'Appointment',
        entityId: 'list',
        action: 'appointment.list',
        metadata: { count: items.length, date, patientId, therapistId },
      });

      return {
        items: items.map((a) => ({
          id: a.id,
          version: a.version,
          patientId: a.patientId,
          therapistId: a.therapistId,
          appointmentTypeId: a.appointmentTypeId,
          roomId: a.roomId,
          startAt: a.startAt.toISOString(),
          endAt: a.endAt.toISOString(),
          status: a.status,
          reason: a.reason,
          notes: a.notes,
          patientName: `${a.patient.firstName} ${a.patient.lastName}`,
          therapistName: a.therapist.name,
          typeName: a.appointmentType.name,
          durationMin: a.appointmentType.durationMin,
        })),
        nextCursor,
      };
    }),

  /**
   * Get available slots for a therapist on a given day.
   * Computes slots based on therapist availability + existing appointments.
   */
  getAvailableSlots: protectedProcedure
    .input(getAvailableSlotsSchema)
    .query(async ({ ctx, input }) => {
      const { therapistId, appointmentTypeId, date } = input;

      // Get the appointment type to know the duration
      const apptType = await db.appointmentType.findUnique({
        where: { id: appointmentTypeId },
      });
      if (!apptType) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appointment type not found' });
      }

      // Get therapist availability for this weekday
      const dayStart = new Date(date);
      const weekday = dayStart.getDay(); // 0=Sun ... 6=Sat

      const availability = await db.availability.findMany({
        where: {
          userId: therapistId,
          weekday,
          validFrom: { lte: dayStart },
          OR: [{ validUntil: null }, { validUntil: { gte: dayStart } }],
        },
      });

      if (availability.length === 0) {
        return { slots: [] };
      }

      // Get existing appointments for this therapist on this day
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const existing = await db.appointment.findMany({
        where: {
          therapistId,
          startAt: { gte: dayStart, lt: dayEnd },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        select: { startAt: true, endAt: true },
      });

      // Generate 15-minute interval slots within each availability window
      const slots: { startAt: string; endAt: string; available: boolean }[] = [];
      const durationMin = apptType.durationMin;

      for (const window of availability) {
        const windowStart = new Date(dayStart);
        windowStart.setHours(0, 0, 0, 0);
        windowStart.setMinutes(window.startMin);
        const windowEnd = new Date(dayStart);
        windowEnd.setHours(0, 0, 0, 0);
        windowEnd.setMinutes(window.endMin);

        // Generate slots at 15-minute intervals
        for (let t = windowStart; t < windowEnd; t = new Date(t.getTime() + 15 * 60 * 1000)) {
          const slotEnd = new Date(t.getTime() + durationMin * 60 * 1000);
          if (slotEnd > windowEnd) break;

          // Check if this slot conflicts with any existing appointment
          const conflicts = existing.some(
            (e) => t < e.endAt && slotEnd > e.startAt,
          );

          // Don't show past slots
          const isPast = t < new Date();

          slots.push({
            startAt: t.toISOString(),
            endAt: slotEnd.toISOString(),
            available: !conflicts && !isPast,
          });
        }
      }

      return { slots };
    }),

  /**
   * Book an appointment — THE CRITICAL CONCURRENCY TASK.
   *
   * Constraint #5: distributed lock prevents double-booking.
   * Constraint #3: idempotency key prevents duplicate appointments from retries.
   * Constraint #4: optimistic locking on the Appointment entity.
   *
   * Flow:
   *   1. Acquire distributed lock on the slot (30s TTL)
   *   2. Check for conflicts (same therapist + overlapping time)
   *   3. Create the Appointment (version=0)
   *   4. Write outbox event 'appointment.booked'
   *   5. Release the lock
   *   6. Log PHI audit
   */
  book: idempotentProcedure
    .input(bookAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { patientId, therapistId, appointmentTypeId, roomId, startAt, reason, notes } = input;

      const startDate = new Date(startAt);

      // Get the appointment type for duration
      const apptType = await db.appointmentType.findUnique({
        where: { id: appointmentTypeId },
      });
      if (!apptType) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appointment type not found' });
      }

      const endDate = new Date(startDate.getTime() + apptType.durationMin * 60 * 1000);

      // ─── DISTRIBUTED LOCK (Constraint #5) ───────────────────────
      // Acquire a lock on this specific slot to prevent two patients
      // from booking the same slot simultaneously.
      const lockKey = `appt:slot:${therapistId}:${startDate.toISOString()}`;
      const lockHandle = await lock.acquire(lockKey, BOOKING_LOCK_TTL_MS);

      if (!lockHandle) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'SLOT_BEING_BOOKED: Another user is booking this slot. Please try again in a moment.',
        });
      }

      try {
        // ─── CONFLICT CHECK ───────────────────────────────────────
        // Check for overlapping appointments for this therapist
        const conflicting = await db.appointment.findFirst({
          where: {
            therapistId,
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            AND: [
              { startAt: { lt: endDate } },
              { endAt: { gt: startDate } },
            ],
          },
        });

        if (conflicting) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'SLOT_TAKEN: This time slot conflicts with an existing appointment.',
          });
        }

        // ─── CREATE APPOINTMENT ───────────────────────────────────
        const appointment = await db.appointment.create({
          data: {
            patientId,
            therapistId,
            appointmentTypeId,
            roomId: roomId ?? null,
            startAt: startDate,
            endAt: endDate,
            status: 'SCHEDULED',
            reason: reason ?? null,
            notes: notes ?? null,
          } as Parameters<typeof db.appointment.create>[0]['data'],
        });

        // ─── OUTBOX EVENT (for reminders, DOC5 §7.3) ──────────────
        const tenantId = getTenantId();
        if (tenantId) {
          await writeOutbox(db as unknown as Parameters<typeof writeOutbox>[0], {
            tenantId,
            eventType: 'appointment.booked',
            payload: {
              appointmentId: appointment.id,
              patientId,
              therapistId,
              startAt: startDate.toISOString(),
            },
          });
        }

        // ─── PHI AUDIT LOG ────────────────────────────────────────
        await logAudit({
          actorId: ctx.user.userId,
          action: 'appointment.book',
          entity: 'Appointment',
          entityId: appointment.id,
          phi: true,
          metadata: { patientId, therapistId, startAt: startDate.toISOString() },
        });

        return {
          id: appointment.id,
          version: appointment.version,
          patientId: appointment.patientId,
          therapistId: appointment.therapistId,
          appointmentTypeId: appointment.appointmentTypeId,
          roomId: appointment.roomId,
          startAt: appointment.startAt.toISOString(),
          endAt: appointment.endAt.toISOString(),
          status: appointment.status,
          reason: appointment.reason,
          notes: appointment.notes,
        };
      } finally {
        // ─── RELEASE LOCK ─────────────────────────────────────────
        await lock.release(lockHandle);
      }
    }),

  /**
   * Update an appointment (optimistic locking, Constraint #4).
   */
  update: protectedProcedure
    .input(updateAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, version, ...patch } = input;

      const updated = await withOptimisticLock({
        model: db.appointment,
        id,
        expectedVersion: version,
        patch: {
          ...(patch.status && { status: patch.status }),
          ...(patch.roomId !== undefined && { roomId: patch.roomId ?? null }),
          ...(patch.reason !== undefined && { reason: patch.reason ?? null }),
          ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
        },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'appointment.update',
        entity: 'Appointment',
        entityId: id,
        phi: true,
        metadata: { version: updated?.version },
      });

      return updated
        ? {
            id: updated.id,
            version: updated.version,
            status: updated.status,
          }
        : null;
    }),

  /**
   * Cancel an appointment (optimistic locking).
   * Writes outbox event for waitlist promotion (TASK-022).
   */
  cancel: protectedProcedure
    .input(cancelAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const updated = await withOptimisticLock({
        model: db.appointment,
        id: input.id,
        expectedVersion: input.version,
        patch: { status: 'CANCELLED' },
      });

      // Outbox event for waitlist promotion (TASK-022)
      const tenantId = getTenantId();
      if (tenantId && updated) {
        await writeOutbox(db as unknown as Parameters<typeof writeOutbox>[0], {
          tenantId,
          eventType: 'appointment.cancelled',
          payload: { appointmentId: input.id },
        });
      }

      await logAudit({
        actorId: ctx.user.userId,
        action: 'appointment.cancel',
        entity: 'Appointment',
        entityId: input.id,
        phi: true,
        metadata: { reason: input.reason },
      });

      return updated ? { id: updated.id, status: updated.status } : null;
    }),

  /**
   * Get appointment types (for the booking form).
   */
  types: protectedProcedure.query(async () => {
    return db.appointmentType.findMany({ orderBy: { name: 'asc' } });
  }),

  /**
   * Get rooms (for the booking form).
   */
  rooms: protectedProcedure.query(async () => {
    return db.room.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  }),

  /**
   * Get therapists (users with THERAPIST role, for the booking form).
   */
  therapists: protectedProcedure.query(async () => {
    const users = await db.user.findMany({
      where: { role: 'THERAPIST', status: 'ACTIVE' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return users;
  }),
});
