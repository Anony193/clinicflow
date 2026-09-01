/**
 * Unit Tests: Optimistic Locking (TASK-009)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { baseDb, db } from '@/lib/db';
import { runInTenantContext, bypassTenantCheck } from '@/lib/context/tenant-context';
import { withOptimisticLock, OptimisticLockError } from '@/server/lib/optimistic-lock';

let tenantId: string;

beforeAll(async () => {
  await bypassTenantCheck(async () => {
    const existing = await baseDb.tenant.findFirst({ where: { slug: 'unit-test' } });
    if (existing) {
      await baseDb.patient.deleteMany({ where: { tenantId: existing.id } });
      await baseDb.user.deleteMany({ where: { tenantId: existing.id } });
      await baseDb.tenant.delete({ where: { id: existing.id } });
    }
    const tenant = await baseDb.tenant.create({ data: { name: 'Unit Test', slug: 'unit-test' } });
    tenantId = tenant.id;
  });
});

afterAll(async () => {
  await bypassTenantCheck(async () => {
    await baseDb.patient.deleteMany({ where: { tenantId } });
    await baseDb.tenant.delete({ where: { id: tenantId } });
  });
  await baseDb.$disconnect();
});

describe('Optimistic Locking', () => {
  it('updates with correct version', async () => {
    await runInTenantContext(tenantId, async () => {
      const p = await db.patient.create({ data: { firstName: 'OL', lastName: 'T', email: 'ol@example.com' } });
      const u = await withOptimisticLock({ model: db.patient, id: p.id, expectedVersion: 0, patch: { firstName: 'Updated' } });
      expect(u?.version).toBe(1);
      expect(u?.firstName).toBe('Updated');
      await db.patient.delete({ where: { id: p.id } });
    });
  });

  it('rejects stale version', async () => {
    await runInTenantContext(tenantId, async () => {
      const p = await db.patient.create({ data: { firstName: 'S', lastName: 'T', email: 's@example.com' } });
      await withOptimisticLock({ model: db.patient, id: p.id, expectedVersion: 0, patch: { firstName: 'U' } });
      await expect(withOptimisticLock({ model: db.patient, id: p.id, expectedVersion: 0, patch: { firstName: 'Fail' } }))
        .rejects.toThrow(OptimisticLockError);
      await db.patient.delete({ where: { id: p.id } });
    });
  });
});
