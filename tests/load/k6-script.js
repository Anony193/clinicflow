/**
 * k6 Load Test Script (TASK-044, DOC4 §5 Table 2)
 *
 * Tests the system at 10× average peak load.
 * Targets: p95 read < 300ms, p95 write < 800ms.
 *
 * Run: k6 run tests/load/k6-script.js
 * Requires: k6 installed (https://k6.io)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const readLatency = new Trend('read_latency', true);
const writeLatency = new Trend('write_latency', true);
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up to 50 users
    { duration: '1m', target: 100 },   // ramp up to 100 users
    { duration: '2m', target: 500 },   // ramp up to 500 users (10x peak)
    { duration: '1m', target: 500 },   // hold at 500
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],  // 95% of requests under 300ms
    errors: ['rate<0.01'],             // error rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Health check (read)
  const healthRes = http.get(`${BASE_URL}/api/trpc/health.check`);
  readLatency.add(healthRes.timings.duration);
  check(healthRes, {
    'health check 200': (r) => r.status === 200,
  });

  // 2. Login (write)
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'owner@riversidept.example',
      password: 'clinicflow-demo-2024',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  writeLatency.add(loginRes.timings.duration);
  const cookies = loginRes.cookies;

  // 3. Patient list (read)
  const patientsRes = http.get(
    `${BASE_URL}/api/trpc/patients.list?input=%7B%22json%22%3A%7B%22limit%22%3A20%7D%7D`,
    { cookies },
  );
  readLatency.add(patientsRes.timings.duration);
  check(patientsRes, {
    'patients 200': (r) => r.status === 200,
  });

  errorRate.add(healthRes.status !== 200 || patientsRes.status !== 200);

  sleep(0.1); // 100ms between requests (simulates user think time)
}
