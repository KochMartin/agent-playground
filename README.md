# Per-Tenant Admission Limiter

> QA campaign F4 – RQ071084 · `qa-F4-2026-06-08 concurrency #2`

A lightweight TypeScript library that enforces per-tenant concurrency caps and
queues excess concurrent runs in strict FIFO order.

## Problem

In a multi-tenant system multiple tenants may submit bursts of concurrent work
simultaneously.  Without a per-tenant guard a single noisy tenant can starve
others or overload shared resources.  A naïve global semaphore is not enough
because it doesn't isolate tenants from each other.

## Solution – `AdmissionLimiter`

`AdmissionLimiter` maintains an independent concurrency bucket for every
tenant:

```
┌─────────────────────────────────────────────────────┐
│  Tenant A  │  running: 2/3  │  queued: 0            │
│  Tenant B  │  running: 3/3  │  queued: 5  ← blocked │
│  Tenant C  │  running: 1/3  │  queued: 0            │
└─────────────────────────────────────────────────────┘
```

* At most `maxConcurrent` tasks execute simultaneously **per tenant**.
* Every task that arrives while the tenant is at capacity is placed in a
  bounded FIFO queue and promoted automatically when a slot opens.
* A hard `queueLimit` per tenant prevents unbounded memory growth; excess
  submissions are rejected with `QueueLimitExceededError`.
* Tenants are garbage-collected from internal state once all their work drains.

## Quick start

```typescript
import { AdmissionLimiter, QueueLimitExceededError } from './src';

const limiter = new AdmissionLimiter({
  maxConcurrent: 3,   // up to 3 parallel runs per tenant
  queueLimit: 100,    // reject if > 100 runs are already waiting
});

async function handleRequest(tenantId: string, workFn: () => Promise<void>) {
  try {
    await limiter.run(tenantId, workFn);
  } catch (err) {
    if (err instanceof QueueLimitExceededError) {
      // Return HTTP 429 to the tenant
    }
    throw err;
  }
}
```

## API

### `new AdmissionLimiter(options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `maxConcurrent` | `number` | `1` | Max parallel runs per tenant |
| `queueLimit` | `number` | `Infinity` | Max queued runs per tenant |

### `limiter.run(tenantId, task)`

Submit an async `task` for `tenantId`.  Returns a promise that resolves/rejects
with the task's result.

### `limiter.runningCount(tenantId)`

Returns the number of currently executing tasks for a tenant.

### `limiter.queuedCount(tenantId)`

Returns the number of tasks waiting in the queue for a tenant.

### `limiter.snapshot()`

Returns a `TenantSnapshot[]` array with `{ tenantId, running, queued }` for
every active tenant.

## Running the tests

```bash
npm install --include=dev
npm test
```

Expected output:

```
Tests: 18 passed, 18 total
```

## Test coverage

| Suite | Scenarios |
|---|---|
| Constructor | Default options, invalid `maxConcurrent`, invalid `queueLimit` |
| Immediate execution | Single task, parallel burst up to cap |
| Queuing excess runs | Cap enforcement, FIFO drain, 10-run burst with cap=3 |
| Tenant isolation | Independent buckets, noisy-neighbour shield |
| Queue limit | `queueLimit=0`, partial fill + overflow, error message |
| Error propagation | Slot recovery after task throw, queued tasks unaffected |
| Tenant GC | State cleanup after drain, zero-counts for unknown tenants |
| Snapshot API | Live multi-tenant snapshot correctness |
