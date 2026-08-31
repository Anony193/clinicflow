/**
 * Optimistic Locking Helper (TASK-009, DOC5 §6.1, Constraint #4)
 *
 * DOC5 §6.1: "Optimistic locking is the strategy that assumes conflicts are
 * rare and that checks for conflicts at the time of the update rather than
 * locking the resource upfront. The implementation uses a version field on
 * each record, and the update includes the version in the WHERE clause, so
 * that the update succeeds only if the version has not changed since the
 * record was read. If the update affects zero rows, the application knows
 * that the record was modified by another process."
 *
 * CONSTRAINT #4: Every concurrent-update entity (Patient, Appointment,
 * SoapNote, Claim) MUST have optimistic locking (version field, checked
 * in the WHERE clause of updates).
 *
 * Usage:
 *   const updated = await withOptimisticLock({
 *     model: db.patient,
 *     id: patientId,
 *     expectedVersion: input.version,
 *     patch: { firstName: input.firstName },
 *   });
 *   // throws OptimisticLockError if version mismatch (0 rows updated)
 */

import { TRPCError } from '@trpc/server';

/** Error thrown when an optimistic lock check fails (version mismatch). */
export class OptimisticLockError extends TRPCError {
  constructor(entity: string, id: string, expectedVersion: number) {
    super({
      code: 'CONFLICT',
      message: `Optimistic lock failed: ${entity} ${id} was modified by another process. ` +
        `Expected version ${expectedVersion} but the record has been updated. ` +
        `Please reload and try again.`,
    });
    this.name = 'OptimisticLockError';
  }
}

/**
 * Perform an optimistic-locked update on a concurrent entity.
 *
 * The update includes `version: expectedVersion` in the WHERE clause and
 * increments the version in the data. If 0 rows are updated, the version
 * has changed (another process modified the record) and we throw
 * OptimisticLockError (HTTP 409 CONFLICT).
 *
 * The tenantId is automatically injected by the Prisma extension (from
 * AsyncLocalStorage) — we don't need to pass it here.
 *
 * @param model - The Prisma model delegate (e.g., db.patient)
 * @param id - The record ID to update
 * @param expectedVersion - The version the client read before editing
 * @param patch - The fields to update (version is auto-incremented)
 */
export async function withOptimisticLock<
  TModel extends Record<string, any>,
>(params: {
  model: TModel;
  id: string;
  expectedVersion: number;
  patch: Record<string, unknown>;
}): Promise<{ id: string; version: number; [key: string]: unknown } | null> {
  const { model, id, expectedVersion, patch } = params;

  // Get the current tenantId from context (set by the Prisma extension)
  // We read it via the same AsyncLocalStorage the extension uses
  const { getTenantId } = await import('@/lib/context/tenant-context');
  const tenantId = getTenantId();

  if (!tenantId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'TENANT_CONTEXT_REQUIRED for optimistic lock',
    });
  }

  // Strip version from patch (never let the client set it directly)
  const { version: _strip, ...cleanPatch } = patch;

  // Use updateMany to avoid P2025 (Prisma's update() throws when 0 rows match).
  // updateMany returns { count: number } — 0 means version mismatch.
  const updateResult = await model.updateMany({
    where: {
      id,
      version: expectedVersion,
      tenantId,
    },
    data: {
      ...cleanPatch,
      version: { increment: 1 },
    },
  });

  if (updateResult.count === 0) {
    throw new OptimisticLockError(
      'Record',
      id,
      expectedVersion,
    );
  }

  // Fetch and return the updated record
  const result = await model.findUnique({
    where: { id, tenantId },
  });

  return result;
}
