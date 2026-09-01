/**
 * Metrics Endpoint (TASK-043)
 * GET /api/metrics — Prometheus-compatible metrics
 */

import { getMetrics } from '@/lib/ports/observability';

export async function GET() {
  return new Response(getMetrics(), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
