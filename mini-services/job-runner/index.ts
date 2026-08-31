/**
 * ClinicFlow Job Runner — Outbox relay (mini-service, port 3003)
 *
 * DOC5 §7.3 Outbox Pattern: "a separate process, the relay, reads the
 * outbox table and publishes the events to the message broker."
 *
 * This is the Inngest substitute (ADR-0002). In production, this would
 * be replaced by Inngest durable functions — the Outbox table would be
 * the Inngest event source.
 *
 * How it works:
 *   1. Polls the Outbox table every 2 seconds for pending events
 *   2. For each event, dispatches to the registered handler
 *   3. On success: marks the event as 'done'
 *   4. On failure: increments attempts, records lastError, retries with backoff
 *   5. After 5 attempts: marks as 'failed' (alert worthy)
 *
 * The job-runner uses the BASE Prisma client (not the tenant-extended one)
 * because it processes events across ALL tenants. Each event carries its
 * own tenantId in the Outbox record.
 *
 * Gateway: reachable via ?XTransformPort=3003 (ADR-0003)
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  log: ['error', 'warn'],
});

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 5;
const PORT = 3003;

// ─── Event Handler Registry ─────────────────────────────────
// Handlers are registered per event type. The job-runner dispatches
// to the matching handler. Domain features register handlers here.

type EventHandler = (
  payload: Record<string, unknown>,
  tenantId: string,
) => Promise<void>;

const handlers = new Map<string, EventHandler>();

export function registerHandler(eventType: string, handler: EventHandler): void {
  handlers.set(eventType, handler);
  console.log(`[job-runner] Registered handler for: ${eventType}`);
}

// ─── Built-in handlers ──────────────────────────────────────
// Register placeholder handlers for the event types we expect.
// These will be replaced with real implementations in domain tasks.

registerHandler('appointment.booked', async (payload, tenantId) => {
  console.log(`[job-runner] appointment.booked: tenant=${tenantId}, appointment=${payload.appointmentId}`);
  // TASK-023: send reminder schedule (24h before, 2h before)
  // TASK-023: send confirmation email
});

registerHandler('appointment.cancelled', async (payload, tenantId) => {
  console.log(`[job-runner] appointment.cancelled: tenant=${tenantId}, appointment=${payload.appointmentId}`);
  // TASK-022: promote waitlist entry
});

registerHandler('claim.submitted', async (payload, tenantId) => {
  console.log(`[job-runner] claim.submitted: tenant=${tenantId}, claim=${payload.claimId}`);
  // TASK-033: submit to clearinghouse via circuit breaker
});

registerHandler('subscription.activated', async (payload, tenantId) => {
  console.log(`[job-runner] subscription.activated: tenant=${tenantId}`);
  // TASK-029: send welcome email, configure default feature flags
});

// ─── Polling Loop ───────────────────────────────────────────

async function processOutboxBatch(): Promise<number> {
  // Fetch pending events (oldest first, limit 10 per batch)
  const events = await db.outbox.findMany({
    where: {
      status: 'pending',
      OR: [
        { attempts: 0 },
        {
          attempts: { lt: MAX_ATTEMPTS },
          // Exponential backoff: wait 2^attempts seconds before retry
          // (attempt 1: 2s, attempt 2: 4s, attempt 3: 8s, attempt 4: 16s)
        },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  if (events.length === 0) return 0;

  let processed = 0;
  for (const event of events) {
    // Mark as processing to avoid duplicate dispatch
    await db.outbox.update({
      where: { id: event.id },
      data: { status: 'processing' },
    }).catch(() => {}); // race condition guard

    try {
      const payload = JSON.parse(event.payload) as Record<string, unknown>;
      const handler = handlers.get(event.eventType);

      if (handler) {
        await handler(payload, event.tenantId);
      } else {
        console.warn(`[job-runner] No handler for event type: ${event.eventType}`);
      }

      // Success — mark as done
      await db.outbox.update({
        where: { id: event.id },
        data: { status: 'done', processedAt: new Date() },
      });
      processed++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const newAttempts = event.attempts + 1;
      const isFailed = newAttempts >= MAX_ATTEMPTS;

      console.error(
        `[job-runner] Event ${event.id} failed (attempt ${newAttempts}/${MAX_ATTEMPTS}):`,
        errorMessage,
      );

      await db.outbox.update({
        where: { id: event.id },
        data: {
          status: isFailed ? 'failed' : 'pending',
          attempts: newAttempts,
          lastError: errorMessage.slice(0, 1000),
        },
      });
    }
  }

  return processed;
}

async function pollLoop(): Promise<void> {
  while (true) {
    try {
      const processed = await processOutboxBatch();
      if (processed > 0) {
        console.log(`[job-runner] Processed ${processed} event(s)`);
      }
    } catch (error) {
      console.error('[job-runner] Poll error:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// ─── Health endpoint (for gateway) ──────────────────────────
// Simple HTTP server on port 3003 for health checks.
const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/health' || url.pathname === '/') {
      return Response.json({
        ok: true,
        service: 'clinicflow-job-runner',
        port: PORT,
        uptime: process.uptime(),
      });
    }
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[job-runner] 🚀 Running on port ${PORT}`);
console.log(`[job-runner] Polling Outbox every ${POLL_INTERVAL_MS}ms`);
console.log(`[job-runner] Registered ${handlers.size} event handler(s)`);

// Start the polling loop
pollLoop();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[job-runner] Shutting down...');
  server.stop();
  process.exit(0);
});
