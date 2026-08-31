/**
 * Distributed Lock Port Interface (TASK-010, ADR-0002, Constraint #5)
 *
 * DOC5 §6.3: "The distributed lock is the lock that works across multiple
 * application instances, and it is the lock that is needed when the
 * application runs on multiple servers and the database's row-level lock
 * is not sufficient. The distributed lock is implemented with Redis, using
 * the SET NX command to acquire the lock and the DEL command to release it,
 * with a time-to-live that ensures the lock is released if the holder
 * crashes."
 *
 * CONSTRAINT #5: Appointment booking MUST use a distributed lock (Redis
 * SET NX with TTL) to prevent double-booking the same slot.
 *
 * This is the port interface. The SQLite adapter (lock.sqlite.ts) is the
 * sandbox implementation; the Redis adapter (lock.redis.ts) is the
 * production implementation. Selected via env var in lock.ts.
 */

/** A handle representing an acquired lock. */
export interface LockHandle {
  /** The lock key (e.g., "appt:slot:therapist-123:2026-09-01T10:00:00Z") */
  key: string;
  /** A unique holder ID (used to verify ownership on release) */
  holder: string;
  /** When the lock expires (for debugging; the adapter enforces this) */
  expiresAt: Date;
}

/** The distributed lock interface (DOC5 §6.3). */
export interface DistributedLock {
  /**
   * Try to acquire a lock on `key` with the given TTL.
   * Returns the handle if acquired, or null if already held.
   *
   * Implements the Redis SET NX PX semantics:
   *   - SET key value NX PX ttl  →  OK if acquired, nil if already exists
   */
  acquire(key: string, ttlMs: number): Promise<LockHandle | null>;

  /**
   * Release a previously acquired lock.
   * Only the holder that acquired it can release it (prevents releasing
   * a lock that was acquired by another process after expiry).
   */
  release(handle: LockHandle): Promise<void>;

  /**
   * Force-release a lock by key (admin operation, or after expiry cleanup).
   */
  forceRelease(key: string): Promise<void>;
}

/**
 * Generate a unique lock holder ID.
 * Used by the adapter to identify who holds the lock.
 */
export function generateLockHolder(): string {
  // Use crypto.randomUUID if available, else fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
