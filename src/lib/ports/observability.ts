/**
 * Observability Port (TASK-043, DOC1 §5.5)
 *
 * Structured JSON logging + metrics endpoint.
 * Production: Datadog / Sentry adapters.
 * Sandbox: console + /api/metrics endpoint.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  traceId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

// In-memory metrics store (production: Datadog)
const metrics = new Map<string, { count: number; sum: number; lastUpdated: number }>();

/**
 * Structured logger — outputs JSON to stdout.
 * In production, this would be ingested by Datadog / CloudWatch.
 */
export const logger = {
  debug(message: string, meta: Record<string, unknown> = {}) {
    log('debug', message, meta);
  },
  info(message: string, meta: Record<string, unknown> = {}) {
    log('info', message, meta);
  },
  warn(message: string, meta: Record<string, unknown> = {}) {
    log('warn', message, meta);
  },
  error(message: string, meta: Record<string, unknown> = {}) {
    log('error', message, meta);
  },
};

function log(level: LogLevel, message: string, meta: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

/**
 * Record a metric (counter or histogram).
 * In production, this would be sent to Datadog.
 */
export function recordMetric(
  name: string,
  value: number = 1,
  type: 'counter' | 'histogram' = 'counter',
): void {
  const existing = metrics.get(name) ?? { count: 0, sum: 0, lastUpdated: Date.now() };
  existing.count += 1;
  existing.sum += value;
  existing.lastUpdated = Date.now();
  metrics.set(name, existing);
}

/**
 * Get all recorded metrics (for /api/metrics endpoint).
 * Returns Prometheus-compatible format.
 */
export function getMetrics(): string {
  const lines: string[] = [];
  for (const [name, data] of metrics) {
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name}_count ${data.count}`);
    lines.push(`${name}_sum ${data.sum}`);
  }
  return lines.join('\n');
}

/**
 * Capture an exception (production: Sentry).
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
  // In production: Sentry.captureException(error, { extra: context });
}

/**
 * Generate a trace ID for request correlation.
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
