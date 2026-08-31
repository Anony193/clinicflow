/**
 * Redis Distributed Lock Adapter (ADR-0002)
 *
 * Production adapter implementing Redis SET NX PX (DOC5 §6.3).
 *
 * In the sandbox, this is a stub that throws if used — the SQLite adapter
 * is used instead. In production, set LOCK_ADAPTER=redis and configure
 * REDIS_URL, and this adapter will be selected.
 *
 * The production implementation would use the `ioredis` or `redis` package:
 *
 *   import Redis from 'ioredis';
 *   const redis = new Redis(process.env.REDIS_URL!);
 *
 *   async acquire(key, ttlMs) {
 *     const holder = generateLockHolder();
 *     const result = await redis.set(key, holder, 'PX', ttlMs, 'NX');
 *     if (result !== 'OK') return null;
 *     return { key, holder, expiresAt: new Date(Date.now() + ttlMs) };
 *   }
 *
 *   async release(handle) {
 *     // Use Lua script for atomic check-and-delete (prevent releasing
 *     // a lock that was acquired by another process after TTL expiry)
 *     const script = `
 *       if redis.call("get", KEYS[1]) == ARGV[1] then
 *         return redis.call("del", KEYS[1])
 *       else
 *         return 0
 *       end
 *     `;
 *     await redis.eval(script, 1, handle.key, handle.holder);
 *   }
 */

import type { DistributedLock, LockHandle } from '@/lib/ports/lock';

export class RedisLockAdapter implements DistributedLock {
  constructor() {
    throw new Error(
      'RedisLockAdapter is not available in the sandbox. ' +
      'Set LOCK_ADAPTER=sqlite (or omit) to use the SQLite adapter. ' +
      'In production, install ioredis and implement this adapter.',
    );
  }

  acquire(_key: string, _ttlMs: number): Promise<LockHandle | null> {
    throw new Error('RedisLockAdapter not implemented in sandbox');
  }

  release(_handle: LockHandle): Promise<void> {
    throw new Error('RedisLockAdapter not implemented in sandbox');
  }

  forceRelease(_key: string): Promise<void> {
    throw new Error('RedisLockAdapter not implemented in sandbox');
  }
}
