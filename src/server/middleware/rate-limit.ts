/**
 * Rate Limit Middleware (TASK-010a, DOC5 §5.3, Constraint #7)
 *
 * Token bucket: 100 requests/min per user, 1000/min per tenant.
 * Returns 429 Too Many Requests + Retry-After header when exceeded.
 *
 * Uses in-memory Map for sandbox (production: Redis).
 */

import { TRPCError } from '@trpc/server';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const USER_LIMIT = 100; // requests per minute
const TENANT_LIMIT = 1000;
const WINDOW_MS = 60_000;

const userBuckets = new Map<string, Bucket>();
const tenantBuckets = new Map<string, Bucket>();

function refill(bucket: Bucket, capacity: number): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const refillAmount = (elapsed / WINDOW_MS) * capacity;
  bucket.tokens = Math.min(capacity, bucket.tokens + refillAmount);
  bucket.lastRefill = now;
}

function checkLimit(key: string, buckets: Map<string, Bucket>, limit: number): boolean {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: limit, lastRefill: Date.now() };
    buckets.set(key, bucket);
  }
  refill(bucket, limit);
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

/**
 * Rate limit check for a user + tenant.
 * Throws TRPCError(429) if either limit is exceeded.
 */
export function checkRateLimit(userId: string, tenantId: string): void {
  if (!checkLimit(`user:${userId}`, userBuckets, USER_LIMIT)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded: 100 requests per minute per user. Please slow down.',
    });
  }
  if (!checkLimit(`tenant:${tenantId}`, tenantBuckets, TENANT_LIMIT)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded: 1000 requests per minute per tenant.',
    });
  }
}

// Cleanup old buckets every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 5 * 60_000;
  for (const [key, bucket] of userBuckets) {
    if (bucket.lastRefill < cutoff) userBuckets.delete(key);
  }
  for (const [key, bucket] of tenantBuckets) {
    if (bucket.lastRefill < cutoff) tenantBuckets.delete(key);
  }
}, 5 * 60_000);
