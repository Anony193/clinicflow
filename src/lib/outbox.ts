/**
 * Outbox Pattern (TASK-012, DOC5 §7.3, Constraint #14)
 *
 * DOC5 §7.3: "The Outbox pattern solves [the dual-write problem] by writing
 * the event to an outbox table in the same database transaction as the
 * business data, and a separate process, the relay, reads the outbox table
 * and publishes the events to the message broker. The Outbox ensures that
 * the event is published if and only if the database transaction commits."
 *
 * Usage in a mutation:
 *   await db.$transaction(async (tx) => {
 *     const appointment = await tx.appointment.create({ data: { ... } });
 *     await writeOutbox(tx, {
 *       tenantId: ctx.tenantId,
 *       eventType: 'appointment.booked',
 *       payload: { appointmentId: appointment.id, ... },
 *     });
 *   });
 *   // The job-runner will pick up the event and dispatch to handlers.
 */

import type { PrismaTransaction } from '@/lib/db';

export interface OutboxEvent {
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

/**
 * Write an event to the Outbox table.
 *
 * MUST be called inside a db.$transaction() — the event is committed
 * atomically with the business data. If the transaction rolls back,
 * the event is not written (no phantom events).
 */
export async function writeOutbox(
  tx: PrismaTransaction,
  event: OutboxEvent,
): Promise<void> {
  await tx.outbox.create({
    data: {
      tenantId: event.tenantId,
      eventType: event.eventType,
      payload: JSON.stringify(event.payload),
      status: 'pending',
    },
  });
}

/**
 * Event handler registry.
 * The job-runner calls dispatchEvent() for each pending Outbox record.
 * Domain features register their handlers here.
 */
type EventHandler = (payload: Record<string, unknown>, tenantId: string) => Promise<void>;

const handlers = new Map<string, EventHandler>();

/**
 * Register a handler for an event type.
 * Called at module load time (e.g., in the job-runner's index.ts).
 */
export function registerHandler(eventType: string, handler: EventHandler): void {
  handlers.set(eventType, handler);
}

/**
 * Dispatch an event to its registered handler.
 * Called by the job-runner when it picks up a pending Outbox record.
 */
export async function dispatchEvent(
  eventType: string,
  payload: Record<string, unknown>,
  tenantId: string,
): Promise<void> {
  const handler = handlers.get(eventType);
  if (!handler) {
    console.warn(`No handler registered for event type: ${eventType}`);
    return;
  }
  await handler(payload, tenantId);
}
