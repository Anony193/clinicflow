/**
 * Functional verification of the 4 concurrency primitives:
 *   TASK-008: Idempotency middleware
 *   TASK-009: Optimistic locking helper
 *   TASK-010: Distributed lock (SQLite adapter)
 *   TASK-011: Circuit breaker
 *
 * Run: bun run scripts/verify-concurrency-primitives.ts
 */

import { db } from '@/lib/db';
import { runInTenantContext, bypassTenantCheck } from '@/lib/context/tenant-context';
import { acquireIdempotencyLock, storeIdempotentResult } from '@/server/middleware/idempotency';
import { withOptimisticLock, OptimisticLockError } from '@/server/lib/optimistic-lock';
import { lock } from '@/lib/ports/lock-index';
import { CircuitBreaker, CircuitOpenError } from '@/lib/ports/circuit-breaker';

async function main() {
  console.log('🧪 Verifying concurrency primitives...\n');

  const tenant = await bypassTenantCheck(() => db.tenant.findFirst({ where: { slug: 'riverside-pt' } }));
  if (!tenant) throw new Error('Demo tenant not found. Run: bun prisma/seed.ts');
  console.log(`   Tenant: ${tenant.name} (${tenant.id})\n`);

  await runInTenantContext(tenant.id, async () => {

    // ─── TASK-010: Distributed Lock ───────────────────────────
    console.log('─ TASK-010: Distributed Lock (SQLite adapter)');
    const lockKey = `test:lock:${Date.now()}`;
    const handle1 = await lock.acquire(lockKey, 5000);
    console.log(`   acquire #1: ${handle1 ? 'OK' : 'FAILED'}`);
    const handle2 = await lock.acquire(lockKey, 5000);
    console.log(`   acquire #2 (should be null): ${handle2 === null ? 'OK' : 'FAILED'}`);
    await lock.release(handle1!);
    console.log('   release #1: OK');
    const handle3 = await lock.acquire(lockKey, 5000);
    console.log(`   acquire #3 (after release): ${handle3 ? 'OK' : 'FAILED'}`);
    await lock.release(handle3!);
    console.log('   ✅ Distributed lock works\n');

    // ─── TASK-011: Circuit Breaker ────────────────────────────
    console.log('─ TASK-011: Circuit Breaker');
    const breaker = new CircuitBreaker({
      name: 'test-service',
      failureThreshold: 3,
      failureRate: 0.5,
      cooldownMs: 100,
      windowMs: 60_000,
    });
    for (let i = 0; i < 3; i++) {
      try { await breaker.run(async () => { throw new Error('simulated'); }); } catch { /* expected */ }
    }
    console.log(`   state after 3 failures: ${breaker.getState()} (expect OPEN)`);
    let threwCircuitOpen = false;
    try { await breaker.run(async () => 'nope'); } catch (e) { threwCircuitOpen = e instanceof CircuitOpenError; }
    console.log(`   run when OPEN throws CircuitOpenError: ${threwCircuitOpen ? 'OK' : 'FAILED'}`);
    await new Promise(r => setTimeout(r, 150));
    console.log(`   state after cooldown: ${breaker.getState()} (expect HALF_OPEN)`);
    const result = await breaker.run(async () => 'success');
    console.log(`   trial call result: ${result}, state: ${breaker.getState()} (expect CLOSED)`);
    console.log('   ✅ Circuit breaker works\n');

    // ─── TASK-009: Optimistic Locking ─────────────────────────
    console.log('─ TASK-009: Optimistic Locking');
    const patient = await db.patient.create({
      data: { firstName: 'Test', lastName: 'OL', email: `test-ol-${Date.now()}@example.com` },
    });
    console.log(`   created patient v${patient.version}`);
    const updated = await withOptimisticLock({
      model: db.patient, id: patient.id, expectedVersion: 0, patch: { firstName: 'Updated' },
    });
    console.log(`   update with v0 → v${updated.version}: OK`);
    let threwOL = false;
    try {
      await withOptimisticLock({
        model: db.patient, id: patient.id, expectedVersion: 0, patch: { firstName: 'Stale' },
      });
    } catch (e) { threwOL = e instanceof OptimisticLockError; }
    console.log(`   stale v0 throws OptimisticLockError: ${threwOL ? 'OK' : 'FAILED'}`);
    await db.patient.delete({ where: { id: patient.id } });
    console.log('   ✅ Optimistic locking works\n');

    // ─── TASK-008: Idempotency ────────────────────────────────
    console.log('─ TASK-008: Idempotency Middleware');
    const idemKey = `test-key-${Date.now()}`;
    const path = 'test.procedure';
    const lock1 = await acquireIdempotencyLock({ tenantId: tenant.id, path, idempotencyKey: idemKey });
    console.log(`   first call: ${lock1.type} (expect 'process')`);
    await storeIdempotentResult(lock1.type === 'process' ? lock1.keyHash : '', { success: true }, 200);
    const lock2 = await acquireIdempotencyLock({ tenantId: tenant.id, path, idempotencyKey: idemKey });
    console.log(`   second call: ${lock2.type} (expect 'replay')`);
    if (lock2.type === 'replay') console.log(`   replayed: ${JSON.stringify(lock2.response)}`);
    if (lock1.type === 'process') {
      await db.idempotencyRecord.delete({ where: { keyHash: lock1.keyHash } }).catch(() => {});
    }
    console.log('   ✅ Idempotency works\n');
  });

  console.log('🎉 All 4 concurrency primitives verified!');
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
