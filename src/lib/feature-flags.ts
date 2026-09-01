/**
 * Feature Flags (TASK-015, DOC4 §12.2)
 *
 * Per-tenant feature toggles with 5-min in-memory cache.
 * Flags: patient_portal, stripe_billing, claims_submission,
 *        outcome_measures, exercise_library
 */

import { db } from '@/lib/db';
import { getTenantId } from '@/lib/context/tenant-context';

interface CacheEntry {
  enabled: boolean;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_FLAGS: Record<string, boolean> = {
  patient_portal: true,
  stripe_billing: true,
  claims_submission: true,
  outcome_measures: true,
  exercise_library: true,
};

/**
 * Check if a feature flag is enabled for the current tenant.
 * Uses a 5-min in-memory cache to avoid DB hits on every check.
 */
export async function isEnabled(flagKey: string): Promise<boolean> {
  const tenantId = getTenantId();
  if (!tenantId) return DEFAULT_FLAGS[flagKey] ?? false;

  const cacheKey = `${tenantId}:${flagKey}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled;
  }

  // Fetch from DB
  const flag = await db.featureFlag.findUnique({
    where: { tenantId_key: { tenantId, key: flagKey } },
  });

  const enabled = flag?.enabled ?? DEFAULT_FLAGS[flagKey] ?? false;

  cache.set(cacheKey, { enabled, expiresAt: Date.now() + CACHE_TTL_MS });
  return enabled;
}

/**
 * Set a feature flag for a tenant (bypasses cache).
 */
export async function setFlag(
  tenantId: string,
  flagKey: string,
  enabled: boolean,
): Promise<void> {
  await db.featureFlag.upsert({
    where: { tenantId_key: { tenantId, key: flagKey } },
    update: { enabled },
    create: { tenantId, key: flagKey, enabled },
  });
  cache.set(`${tenantId}:${flagKey}`, { enabled, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Get all feature flags for a tenant.
 */
export async function getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
  const flags = await db.featureFlag.findMany({ where: { tenantId } });
  const result = { ...DEFAULT_FLAGS };
  for (const f of flags) {
    result[f.key] = f.enabled;
  }
  return result;
}

/** Clear the feature flag cache (for testing) */
export function clearFlagCache(): void {
  cache.clear();
}
