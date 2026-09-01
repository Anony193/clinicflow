/**
 * Unit Tests: Circuit Breaker (TASK-011)
 */

import { describe, it, expect } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '@/lib/ports/circuit-breaker';

describe('Circuit Breaker', () => {
  it('starts CLOSED and passes calls through', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 5,
      failureRate: 0.5,
      cooldownMs: 100,
      windowMs: 60_000,
    });

    const result = await breaker.run(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('opens after failureThreshold', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      failureRate: 0.5,
      cooldownMs: 100,
      windowMs: 60_000,
    });

    for (let i = 0; i < 3; i++) {
      try { await breaker.run(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    }

    expect(breaker.getState()).toBe('OPEN');

    await expect(breaker.run(async () => 'should not run')).rejects.toThrow(CircuitOpenError);
  });

  it('transitions OPEN → HALF_OPEN → CLOSED on recovery', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      failureRate: 0.5,
      cooldownMs: 50,
      windowMs: 60_000,
    });

    // Open the circuit
    for (let i = 0; i < 2; i++) {
      try { await breaker.run(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    }
    expect(breaker.getState()).toBe('OPEN');

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 60));
    expect(breaker.getState()).toBe('HALF_OPEN');

    // Successful trial → CLOSED
    const result = await breaker.run(async () => 'recovered');
    expect(result).toBe('recovered');
    expect(breaker.getState()).toBe('CLOSED');
  });
});
