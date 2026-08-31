/**
 * SQLite Distributed Lock Adapter (ADR-0002)
 *
 * Sandbox adapter that emulates Redis SET NX PX using a SQLite Lock table.
 *
 * How it works:
 *   - acquire(key, ttl): INSERT OR NOTHING into Lock table with unique `key`.
 *     If the insert succeeds, the lock is acquired. If it fails (unique
 *     constraint), check if the existing lock has expired; if so, delete
 *     and re-acquire.
 *   - release(handle): DELETE WHERE key = ? AND holder = ? (only the holder
 *     can release).
 *   - forceRelease(key): DELETE WHERE key = ?
 *
 * The `holder` field prevents a process from releasing a lock it doesn't own
 * (e.g., after its TTL expired and another process acquired it).
 *
 * Limitations vs Redis:
 *   - Not truly distributed across processes (SQLite is single-file).
 *     In the sandbox, the Next.js server is a single process, so this is fine.
 *   - In production, swap to lock.redis.ts (Redis SET NX PX).
 */

import { db } from '@/lib/db';
import type { DistributedLock, LockHandle } from '@/lib/ports/lock';
import { generateLockHolder } from '@/lib/ports/lock';
import { getTenantId } from '@/lib/context/tenant-context';

export class SqliteLockAdapter implements DistributedLock {
  async acquire(key: string, ttlMs: number): Promise<LockHandle | null> {
    const tenantId = getTenantId();
    if (!tenantId) {
      throw new Error('TENANT_CONTEXT_REQUIRED: cannot acquire lock without tenant context');
    }

    const holder = generateLockHolder();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    // Try to insert (INSERT OR NOTHING via Prisma's create with unique constraint)
    try {
      await db.lock.create({
        data: { tenantId, key, holder, expiresAt },
      });
      return { key, holder, expiresAt };
    } catch {
      // Lock exists — check if expired
    }

    // Look up the existing lock
    const existing = await db.lock.findUnique({ where: { key } });
    if (!existing) {
      // Was deleted between our insert failure and lookup — retry once
      try {
        await db.lock.create({
          data: { tenantId, key, holder, expiresAt },
        });
        return { key, holder, expiresAt };
      } catch {
        return null;
      }
    }

    // If expired, delete and re-acquire
    if (existing.expiresAt < now) {
      await db.lock.deleteMany({ where: { key, holder: existing.holder } });
      try {
        await db.lock.create({
          data: { tenantId, key, holder, expiresAt },
        });
        return { key, holder, expiresAt };
      } catch {
        return null;
      }
    }

    // Still held by someone else
    return null;
  }

  async release(handle: LockHandle): Promise<void> {
    // Only delete if the holder matches (prevents releasing a lock
    // that was acquired by another process after our TTL expired)
    await db.lock.deleteMany({
      where: { key: handle.key, holder: handle.holder },
    });
  }

  async forceRelease(key: string): Promise<void> {
    await db.lock.deleteMany({ where: { key } });
  }
}
