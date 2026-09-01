/**
 * Lock Port Selector (ADR-0002)
 * - sqlite (default): sandbox
 * - redis: production
 */

import type { DistributedLock } from '@/lib/ports/lock';
import { SqliteLockAdapter } from '@/lib/ports/lock.sqlite';

const adapterName = process.env.LOCK_ADAPTER ?? 'sqlite';

let adapter: DistributedLock | null = null;

// For sandbox, eagerly create the sqlite adapter
if (adapterName === 'sqlite') {
  adapter = new SqliteLockAdapter();
}

// For production, the redis adapter is lazily loaded
async function getRedisAdapter(): Promise<DistributedLock> {
  if (adapter) return adapter;
  const { RedisLockAdapter } = await import('@/lib/ports/lock.redis');
  adapter = new RedisLockAdapter();
  return adapter;
}

function getAdapter(): DistributedLock {
  if (adapter) return adapter;
  // Redis requires async init; throw with guidance
  throw new Error('Redis lock adapter not initialized. Call initLock() at startup.');
}

export async function initLock(): Promise<void> {
  if (adapterName === 'redis' && !adapter) {
    await getRedisAdapter();
  }
}

export const lock: DistributedLock = {
  async acquire(key, ttlMs) {
    if (adapterName === 'redis' && !adapter) await initLock();
    return getAdapter().acquire(key, ttlMs);
  },
  async release(handle) {
    if (adapterName === 'redis' && !adapter) await initLock();
    return getAdapter().release(handle);
  },
  async forceRelease(key) {
    if (adapterName === 'redis' && !adapter) await initLock();
    return getAdapter().forceRelease(key);
  },
};
