# Per-Tenant Admission Limiter

> QA campaign F4 concurrency burst — RQ071085

A lightweight, zero-dependency TypeScript utility that limits the number of
**concurrently executing async tasks per tenant** while **queuing** any excess
runs (instead of rejecting them).  As soon as an active slot becomes free the
next queued task for that tenant is promoted automatically.

---

## Features

| Feature | Detail |
|---|---|
| Independent budgets | Each tenant ID has its own slot counter. |
| FIFO queuing | Excess tasks wait in submission order. |
| Error resilience | Slot is released even when a task rejects; the queue keeps draining. |
| Zero dependencies | Pure TypeScript, no external runtime deps. |

---

## Quick Start

```ts
import { AdmissionLimiter } from './src/concurrency/AdmissionLimiter';

const limiter = new AdmissionLimiter({ maxConcurrent: 2 });

// Runs immediately (slot available).
limiter.run('tenant-acme', async () => doWork());

// Queued if both slots are taken.
limiter.run('tenant-acme', async () => doMoreWork());
limiter.run('tenant-acme', async () => doEvenMoreWork()); // ← queued
```

---

## API

### `new AdmissionLimiter(options)`

| Option | Type | Description |
|---|---|---|
| `maxConcurrent` | `number` | Max concurrent runs per tenant (≥ 1, integer). |

### `.run(tenantId, fn)`

Submits `fn` for execution.  Returns a `Promise<T>` that resolves/rejects with
`fn()`'s outcome.

### `.activeCount(tenantId)`

Returns the number of currently running tasks for `tenantId`.

### `.queuedCount(tenantId)`

Returns the number of waiting tasks for `tenantId`.

### `.allStats()`

Returns `TenantStats[]` — a snapshot of every tenant that currently has active
or queued tasks.

---

## Running Tests

```bash
npm install
npm test
```

---

## Design Notes

- **Tenant isolation**: slot counters are stored in separate `Map` entries so
  one tenant's burst cannot starve another.
- **Back-pressure**: callers naturally await their own slot; no tasks are
  discarded.
- **Slot release on error**: the `finally` block in `_execute` guarantees the
  slot is freed regardless of task outcome, preventing deadlocks.
