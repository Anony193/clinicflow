/**
 * Redis Distributed Lock Adapter (Production)
 *
 * Real Redis implementation using ioredis with:
 *   - SET NX PX for atomic lock acquisition (DOC5 §6.3)
 *   - Lua script for atomic check-and-delete on release
 *     (prevents releasing a lock acquired by another process after TTL expiry)
 *   - Automatic reconnection
 *   - TLS support (rediss://)
 *
 * Selected when LOCK_ADAPTER=redis
 */

import Redis from 'ioredis';
import type { DistributedLock, LockHandle } from '@/lib/ports/lock';
import { generateLockHolder } from '@/lib/ports/lock';

// Lua script for atomic release: only delete if the holder matches
// This prevents a process from releasing a lock it no longer owns
// (e.g., after TTL expiry, another process acquired it)
const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export class RedisLockAdapter implements DistributedLock {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is required when LOCK_ADAPTER=redis');
    }
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => Math.min(times * 50, 500),
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
        return targetErrors.some((e) => err.message.includes(e));
      },
    });
  }

  async acquire(key: string, ttlMs: number): Promise<LockHandle | null> {
    const holder = generateLockHolder();
    // SET key value NX PX ttl — atomic acquire
    const result = await this.redis.set(key, holder, 'PX', ttlMs, 'NX');
    if (result !== 'OK') {
      return null;
    }
    return {
      key,
      holder,
      expiresAt: new Date(Date.now() + ttlMs),
    };
  }

  async release(handle: LockHandle): Promise<void> {
    // Atomic check-and-delete via Lua script
    await this.redis.eval(RELEASE_SCRIPT, 1, handle.key, handle.holder);
  }

  async forceRelease(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
