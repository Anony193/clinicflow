/**
 * Patients Router (TASK-019, DOC0 §(b).3, Constraints #1/#4/#12)
 *
 * Patient management: list (cursor-paginated + search), get, create
 * (idempotent), update (optimistic-locked), archive.
 *
 * Constraint #1: tenant_id on every query (enforced by Prisma extension)
 * Constraint #4: optimistic locking on Patient (version field in WHERE)
 * Constraint #12: PHI access logging (every read logs AuditEvent with phi=true)
 *
 * DOC3 §8: Zod input/output schemas → tRPC procedure → typed Prisma client
 * DOC3 §9.2: cursor-based pagination
 * DOC3 §9.3: optimistic updates via onMutate (frontend)
 */

import { z } from 'zod';
import { router, protectedProcedure, idempotentProcedure } from '@/server/trpc';
import { db } from '@/lib/db';
import { withOptimisticLock } from '@/server/lib/optimistic-lock';
import { logAudit, logPhiAccess, PHI_ENTITIES } from '@/server/lib/audit';
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
} from '@/server/schemas/patient';

export const patientsRouter = router({
  /**
   * List patients — cursor-paginated with optional search.
   * DOC3 §9.2: cursor-based pagination (stable under insertion/deletion).
   *
   * PHI access is logged once per list query (not per row).
   */
  list: protectedProcedure
    .input(listPatientsSchema)
    .query(async ({ ctx, input }) => {
      const { search, cursor, limit } = input;

      // Build the where clause (tenantId is auto-injected by the extension)
      const where = {
        ...(search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { mrn: { contains: search } },
              ],
            }
          : {}),
        status: { not: 'archived' },
      };

      const patients = await db.patient.findMany({
        where,
        take: limit + 1, // take one extra to determine if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { lastName: 'asc' },
      });

      const hasMore = patients.length > limit;
      const items = hasMore ? patients.slice(0, limit) : patients;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      // Log PHI access (list query touches PHI)
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'Patient',
        entityId: 'list',
        action: 'patient.list',
        metadata: { search, count: items.length },
      });

      return {
        items: items.map(serializePatient),
        nextCursor,
      };
    }),

  /**
   * Get a single patient by ID.
   * Logs PHI access (who/what/when per Constraint #12).
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const patient = await db.patient.findUnique({
        where: { id: input.id },
        include: {
          insurancePlans: true,
          appointments: {
            take: 10,
            orderBy: { startAt: 'desc' },
            include: { appointmentType: true },
          },
        },
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Log PHI access
      await logPhiAccess({
        actorId: ctx.user.userId,
        entity: 'Patient',
        entityId: patient.id,
        action: 'patient.read',
        metadata: { mrn: patient.mrn },
      });

      return {
        ...serializePatient(patient),
        insurancePlans: patient.insurancePlans,
        appointments: patient.appointments.map((a) => ({
          ...a,
          startAt: a.startAt.toISOString(),
        })),
      };
    }),

  /**
   * Create a new patient.
   * Idempotent (Constraint #3): client sends Idempotency-Key header.
   * PHI audit logged.
   */
  create: idempotentProcedure
    .input(createPatientSchema)
    .mutation(async ({ ctx, input }) => {
      const patient = await db.patient.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          sex: input.sex ?? null,
          mrn: input.mrn ?? null,
          medicalHistory: input.medicalHistory
            ? JSON.stringify(input.medicalHistory)
            : null,
          status: 'active',
        } as Parameters<typeof db.patient.create>[0]['data'],
      });

      // Log the PHI mutation
      await logAudit({
        actorId: ctx.user.userId,
        action: 'patient.create',
        entity: 'Patient',
        entityId: patient.id,
        phi: true,
        metadata: { firstName: patient.firstName, lastName: patient.lastName },
      });

      return serializePatient(patient);
    }),

  /**
   * Update a patient.
   * Optimistic locking (Constraint #4): version field checked in WHERE.
   * PHI audit logged.
   */
  update: protectedProcedure
    .input(updatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, version, ...patch } = input;

      const updated = await withOptimisticLock({
        model: db.patient,
        id,
        expectedVersion: version,
        patch: {
          ...(patch.firstName !== undefined && { firstName: patch.firstName }),
          ...(patch.lastName !== undefined && { lastName: patch.lastName }),
          ...(patch.dateOfBirth !== undefined && {
            dateOfBirth: patch.dateOfBirth ? new Date(patch.dateOfBirth) : null,
          }),
          ...(patch.email !== undefined && { email: patch.email ?? null }),
          ...(patch.phone !== undefined && { phone: patch.phone ?? null }),
          ...(patch.address !== undefined && { address: patch.address ?? null }),
          ...(patch.sex !== undefined && { sex: patch.sex ?? null }),
          ...(patch.mrn !== undefined && { mrn: patch.mrn ?? null }),
          ...(patch.status !== undefined && { status: patch.status }),
          ...(patch.medicalHistory !== undefined && {
            medicalHistory: patch.medicalHistory
              ? JSON.stringify(patch.medicalHistory)
              : null,
          }),
        },
      });

      // Log the PHI mutation
      await logAudit({
        actorId: ctx.user.userId,
        action: 'patient.update',
        entity: 'Patient',
        entityId: id,
        phi: true,
        metadata: { version: updated?.version },
      });

      return updated ? serializePatient(updated as PatientRow) : null;
    }),

  /**
   * Archive a patient (soft delete — sets status to 'archived').
   * Does NOT delete the record (PHI must be retained per HIPAA).
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string(), version: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await withOptimisticLock({
        model: db.patient,
        id: input.id,
        expectedVersion: input.version,
        patch: { status: 'archived' },
      });

      await logAudit({
        actorId: ctx.user.userId,
        action: 'patient.archive',
        entity: 'Patient',
        entityId: input.id,
        phi: true,
      });

      return updated ? serializePatient(updated as PatientRow) : null;
    }),

  /**
   * Stats — count of active patients (for dashboard).
   */
  count: protectedProcedure.query(async ({ ctx }) => {
    const count = await db.patient.count({
      where: { status: { not: 'archived' } },
    });
    return { count };
  }),
});

/** Patient row type (for serialization). */
type PatientRow = {
  id: string;
  version: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  sex: string | null;
  mrn: string | null;
  status: string;
  medicalHistory: string | null;
  consentFormUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Serialize a Patient record for the API (converts Date → ISO string). */
function serializePatient(p: PatientRow) {
  return {
    id: p.id,
    version: p.version,
    firstName: p.firstName,
    lastName: p.lastName,
    dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
    email: p.email,
    phone: p.phone,
    address: p.address,
    sex: p.sex,
    mrn: p.mrn,
    status: p.status,
    medicalHistory: p.medicalHistory ? JSON.parse(p.medicalHistory) : null,
    consentFormUrl: p.consentFormUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
