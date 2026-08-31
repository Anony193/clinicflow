/**
 * Lock Port Selector (ADR-0002)
 *
 * Selects the distributed lock adapter based on LOCK_ADAPTER env var.
 * Defaults to SQLite in the sandbox; Redis in production.
 *
 * Usage:
 *   import { lock } from '@/lib/ports/lock-index';
 *   const handle = await lock.acquire('appt:slot:therapist-123:2026-09-01T10:00:00Z', 30000);
 *   if (!handle) throw new Error('Slot is being booked by another user');
 *   try { ... book the appointment ... } finally { await lock.release(handle); }
 */

import type { DistributedLock } from '@/lib/ports/lock';
import { SqliteLockAdapter } from '@/lib/ports/lock.sqlite';

const adapterName = process.env.LOCK_ADAPTER ?? 'sqlite';

let adapter: DistributedLock | null = null;

function getAdapter(): DistributedLock {
  if (adapter) return adapter;
  switch (adapterName) {
    case 'sqlite':
      adapter = new SqliteLockAdapter();
      break;
    case 'redis':
      // Lazy-load to avoid importing the stub in the sandbox
      // In production with ioredis installed, this would work
      throw new Error(
        'Redis lock adapter not yet implemented. ' +
        'Use LOCK_ADAPTER=sqlite for the sandbox, or implement lock.redis.ts with ioredis.',
      );
    default:
      throw new Error(`Unknown LOCK_ADAPTER: ${adapterName}`);
  }
  return adapter;
}

/** The distributed lock instance (SQLite in sandbox, Redis in production). */
export const lock: DistributedLock = {
  acquire: (key: string, ttlMs: number) => getAdapter().acquire(key, ttlMs),
  release: (handle: Parameters<DistributedLock['release']>[0]) =>
    getAdapter().release(handle),
  forceRelease: (key: string) => getAdapter().forceRelease(key),
};
