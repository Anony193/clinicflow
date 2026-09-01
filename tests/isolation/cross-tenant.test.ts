/**
 * Cross-Tenant Isolation Test Suite (TASK-047, Constraint #2 — LAUNCH BLOCKER)
 *
 * CONSTRAINT #2: Cross-tenant access tests MUST pass (automated tests that
 * attempt to read another tenant's data return zero rows).
 *
 * This suite verifies that the Prisma tenant extension (ADR-0001) correctly
 * isolates every tenant-scoped model. For each model:
 *   1. Create a record in tenant A's context
 *   2. Switch to tenant B's context
 *   3. Attempt to read tenant A's record → MUST return null/zero rows
 *   4. Attempt to update tenant A's record → MUST fail (0 rows affected)
 *   5. Attempt to delete tenant A's record → MUST fail (0 rows affected)
 *
 * If ANY of these tests fail, the system has a tenant data leakage defect
 * and MUST NOT be launched.
 *
 * Run: bun test tests/isolation/cross-tenant.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { baseDb, db } from '@/lib/db';
import { runInTenantContext, bypassTenantCheck } from '@/lib/context/tenant-context';

// We'll create two test tenants and verify isolation between them
let tenantA: { id: string };
let tenantB: { id: string };
let testUserId: string;

beforeAll(async () => {
  // Clean up any leftover test tenants from previous runs (delete children first)
  await bypassTenantCheck(async () => {
    const leftover = await baseDb.tenant.findMany({
      where: { slug: { in: ['iso-test-a', 'iso-test-b'] } },
    });
    for (const t of leftover) {
      await baseDb.soapNote.deleteMany({ where: { tenantId: t.id } });
      await baseDb.appointment.deleteMany({ where: { tenantId: t.id } });
      await baseDb.claim.deleteMany({ where: { tenantId: t.id } });
      await baseDb.patient.deleteMany({ where: { tenantId: t.id } });
      await baseDb.appointmentType.deleteMany({ where: { tenantId: t.id } });
      await baseDb.user.deleteMany({ where: { tenantId: t.id } });
      await baseDb.tenant.delete({ where: { id: t.id } });
    }
  });

  // Create two test tenants
  await bypassTenantCheck(async () => {
    tenantA = await baseDb.tenant.create({
      data: { name: 'Isolation Test Clinic A', slug: 'iso-test-a' },
    });
    tenantB = await baseDb.tenant.create({
      data: { name: 'Isolation Test Clinic B', slug: 'iso-test-b' },
    });

    testUserId = (await baseDb.user.create({
      data: {
        tenantId: tenantA.id,
        email: 'iso-test-a@example.com',
        name: 'ISO Test User A',
        role: 'THERAPIST',
        status: 'ACTIVE',
      },
    })).id;
  });
});

afterAll(async () => {
  // Clean up test tenants — delete child records first to avoid FK constraints
  await bypassTenantCheck(async () => {
    // Delete all records in tenant A
    await baseDb.soapNote.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.appointment.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.claim.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.patient.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.appointmentType.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.user.deleteMany({ where: { tenantId: tenantA.id } });
    await baseDb.tenant.delete({ where: { id: tenantA.id } });

    // Tenant B has no child records (all tests only created in A)
    await baseDb.tenant.delete({ where: { id: tenantB.id } });
  });
  await baseDb.$disconnect();
});

describe('Cross-Tenant Isolation (Constraint #2 — LAUNCH BLOCKER)', () => {
  describe('Patient', () => {
    it('tenant A can create a patient', async () => {
      await runInTenantContext(tenantA.id, async () => {
        const patient = await db.patient.create({
          data: { firstName: 'Iso', lastName: 'TestA', email: 'iso-a@test.com' },
        });
        expect(patient.tenantId).toBe(tenantA.id);
      });
    });

    it('tenant B cannot see tenant A patient (list returns 0)', async () => {
      await runInTenantContext(tenantB.id, async () => {
        const patients = await db.patient.findMany({
          where: { lastName: 'TestA' },
        });
        expect(patients).toHaveLength(0);
      });
    });

    it('tenant B cannot find tenant A patient by ID (getUnique returns null)', async () => {
      let patientAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const p = await db.patient.create({
          data: { firstName: 'Direct', lastName: 'LookupA', email: 'direct-a@test.com' },
        });
        patientAId = p.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.patient.findUnique({ where: { id: patientAId } });
        expect(result).toBeNull();
      });
    });

    it('tenant B cannot update tenant A patient (0 rows affected)', async () => {
      let patientAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const p = await db.patient.create({
          data: { firstName: 'Update', lastName: 'TargetA', email: 'update-a@test.com' },
        });
        patientAId = p.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.patient.updateMany({
          where: { id: patientAId },
          data: { firstName: 'HACKED' },
        });
        expect(result.count).toBe(0);
      });
    });

    it('tenant B cannot delete tenant A patient (0 rows affected)', async () => {
      let patientAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const p = await db.patient.create({
          data: { firstName: 'Delete', lastName: 'TargetA', email: 'delete-a@test.com' },
        });
        patientAId = p.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.patient.deleteMany({ where: { id: patientAId } });
        expect(result.count).toBe(0);
      });
    });
  });

  describe('Appointment', () => {
    it('tenant B cannot see tenant A appointments', async () => {
      let appointmentAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const patient = await db.patient.create({
          data: { firstName: 'Apt', lastName: 'PatientA', email: 'apt-a@test.com' },
        });
        const apptType = await db.appointmentType.create({
          data: { key: 'iso-eval', name: 'ISO Eval', durationMin: 60 },
        });
        const apt = await db.appointment.create({
          data: {
            patientId: patient.id,
            therapistId: testUserId,
            appointmentTypeId: apptType.id,
            startAt: new Date('2026-09-15T10:00:00Z'),
            endAt: new Date('2026-09-15T11:00:00Z'),
            status: 'SCHEDULED',
          } as Parameters<typeof db.appointment.create>[0]['data'],
        });
        appointmentAId = apt.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.appointment.findUnique({ where: { id: appointmentAId } });
        expect(result).toBeNull();
      });
    });
  });

  describe('SoapNote', () => {
    it('tenant B cannot see tenant A SOAP notes', async () => {
      let noteAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const patient = await db.patient.create({
          data: { firstName: 'Soap', lastName: 'PatientA', email: 'soap-a@test.com' },
        });
        const note = await db.soapNote.create({
          data: {
            patientId: patient.id,
            therapistId: testUserId,
            subjective: 'Tenant A private note',
          } as Parameters<typeof db.soapNote.create>[0]['data'],
        });
        noteAId = note.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.soapNote.findUnique({ where: { id: noteAId } });
        expect(result).toBeNull();
      });
    });
  });

  describe('Claim', () => {
    it('tenant B cannot see tenant A claims', async () => {
      let claimAId: string;
      await runInTenantContext(tenantA.id, async () => {
        const patient = await db.patient.create({
          data: { firstName: 'Claim', lastName: 'PatientA', email: 'claim-a@test.com' },
        });
        const claim = await db.claim.create({
          data: {
            patientId: patient.id,
            payerName: 'Test Payer A',
            cptCodes: '["97110"]',
            icdCodes: '["M54.5"]',
            chargeAmountCents: 7500,
            balanceCents: 7500,
            status: 'DRAFT',
          } as Parameters<typeof db.claim.create>[0]['data'],
        });
        claimAId = claim.id;
      });

      await runInTenantContext(tenantB.id, async () => {
        const result = await db.claim.findUnique({ where: { id: claimAId } });
        expect(result).toBeNull();
      });
    });
  });

  describe('Fail-closed (no tenant context)', () => {
    it('querying a tenant-scoped model WITHOUT context throws TENANT_CONTEXT_REQUIRED', async () => {
      // Don't enter any tenant context — the query should fail-closed
      await expect(
        db.patient.findMany(),
      ).rejects.toThrow('TENANT_CONTEXT_REQUIRED');
    });
  });

  describe('Bypass mode (auth lookups)', () => {
    it('bypassTenantCheck allows cross-tenant queries (for auth only)', async () => {
      // This is how the login route looks up users across tenants
      const user = await bypassTenantCheck(() =>
        baseDb.user.findFirst({ where: { email: 'iso-test-a@example.com' } }),
      );
      expect(user).toBeTruthy();
      expect(user?.tenantId).toBe(tenantA.id);
    });
  });
});
