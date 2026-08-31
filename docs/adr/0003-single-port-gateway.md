# ADR-0003 — Single-port gateway conformance

- **Status:** Proposed (approved for Phase 3 implementation)
- **Date:** Phase 2 / Task TASK-000
- **Governs constraints:** #14 (mini-services reachable), project gateway rules
- **Related docs:** Caddyfile; project conventions; Doc 6 §4.4 (file-level coordination)

## Context
The sandbox exposes **only port 3000** (Next.js) externally, fronted by Caddy. Any additional service (e.g., the job-runner durable-execution worker from ADR-0002, a socket.io real-time relay for patient messaging) must be reachable through the same gateway. Caddy supports this via the `XTransformPort` query parameter (see `Caddyfile`):

```
:81 {
  @transform_port_query { query XTransformPort=* }
  handle @transform_port_query {
    reverse_proxy localhost:{query.XTransformPort} { ... }
  }
  handle { reverse_proxy localhost:3000 { ... } }
}
```

## Decision
1. **Mini-services live in `mini-services/<name>/`** as independent bun projects with a fixed port declared in their `package.json` (not via `PORT` env). Currently planned:
   - `mini-services/job-runner` → port **3003** (Inngest substitute, ADR-0002)
   - `mini-services/socket-relay` → port **3004** (patient portal messaging, TASK-039)
2. **Frontend calls use relative paths + `?XTransformPort=<port>`** — never absolute URLs:
   - ✅ `fetch('/api/jobs/poll?XTransformPort=3003')`
   - ✅ `io('/?XTransformPort=3004')`
   - ❌ `fetch('http://localhost:3003/api/jobs/poll')`
   - ❌ `io('http://localhost:3004')`
3. Each mini-service **auto-restarts on file change** (`bun --hot`).
4. Each mini-service is started in the background and tracked in the worklog.

## Consequences
- **Positive:** No CORS, no cross-origin complexity. Caddy transparently proxies. Production replaces Caddy with AWS ALB + service discovery — frontend call sites unchanged.
- **Negative:** `XTransformPort` is a sandbox-only convention. Production uses DNS-based routing. Documented in TASK-050 cutover runbook.
- The main Next.js app on port 3000 is always reachable without the query param (the `handle` fallback).

## Status
Proposed → Approved for implementation.
