# Per-Tenant Admission Limiter

A TypeScript implementation of a per-tenant concurrency admission controller that queues excess concurrent runs.

## Overview

`TenantAdmissionLimiter` enforces a maximum number of simultaneous in-flight operations per tenant. When a tenant's concurrency budget is exhausted, further calls are enqueued and admitted automatically (FIFO) as running slots free up — proving that a burst of concurrent requests does not exceed the configured limit.

## Features

| Feature | Description |
|---|---|
| **Per-tenant isolation** | Each tenant has its own independent concurrency counter and queue. |
| **Configurable slot limit** | `maxConcurrent` – max simultaneous runs per tenant. |
| **Bounded queue** | Optional `maxQueueDepth` – excess calls are immediately rejected with `QueueDepthExceededError` rather than growing unboundedly. |
| **FIFO drain order** | Queued tasks are admitted in the order they arrived. |
| **Error-safe slot release** | A task that throws still frees its concurrency slot and unblocks the next queued entry. |
| **Introspection** | `activeCount()`, `queuedCount()`, and `snapshot()` for observability. |

## Quick Start

```typescript
import { TenantAdmissionLimiter } from "./src/admission";

const limiter = new TenantAdmissionLimiter({
  maxConcurrent: 3,   // max 3 simultaneous runs per tenant
  maxQueueDepth: 10,  // reject if >10 runs are already waiting
});

// Each call returns a Promise that resolves/rejects with the task's result.
const result = await limiter.run("tenant-abc", async () => {
  // ... do work ...
  return "done";
});
```

## Concurrency Burst Behaviour

```
Tenant "acme" with maxConcurrent=2:

time →

run1 ──────────────┐  (slot 1)
run2 ────────────┐  (slot 2)
run3 [queued]    └──────────  admitted when run2 finishes
run4 [queued]         └─────  admitted when run1 finishes
```

## API

### `new TenantAdmissionLimiter(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `maxConcurrent` | `number` | **required** | Max simultaneous runs per tenant (≥ 1). |
| `maxQueueDepth` | `number` | `Infinity` | Max queued (waiting) runs per tenant. |

### `limiter.run(tenantId, fn)`

Runs `fn` under the tenant's admission limit. Returns a `Promise<T>` that resolves or rejects with the same value as `fn`.

### `limiter.activeCount(tenantId): number`

Returns the number of currently running tasks for the tenant.

### `limiter.queuedCount(tenantId): number`

Returns the number of tasks currently waiting in queue.

### `limiter.snapshot(): Record<string, { running: number; queued: number }>`

Returns a snapshot of all known tenants' admission state.

## Running Tests

```bash
yarn test
# or with coverage
yarn test:ci
```

## Project Structure

```
src/
  admission/
    TenantAdmissionLimiter.ts   ← core implementation
    index.ts                    ← public exports
    __tests__/
      TenantAdmissionLimiter.test.ts  ← 11 test cases
```
