/**
 * AdmissionLimiter – per-tenant concurrency burst test suite
 *
 * QA campaign F4 – RQ071084
 *
 * Proves that the per-tenant admission limiter:
 *   1. Runs up to `maxConcurrent` tasks simultaneously.
 *   2. Queues all tasks that exceed the concurrency cap.
 *   3. Drains the queue in FIFO order as slots free up.
 *   4. Keeps tenants isolated from one another.
 *   5. Rejects tasks when the queue is full (queueLimit).
 *   6. Correctly propagates task errors without poisoning the limiter.
 *   7. Garbage-collects tenant state once all work completes.
 *   8. Handles a burst of N concurrent submissions correctly.
 */

import { AdmissionLimiter, QueueLimitExceededError } from '../AdmissionLimiter';

// ---------------------------------------------------------------------------
// Tiny async helpers
// ---------------------------------------------------------------------------

/** Returns a deferred that exposes resolve/reject externally. */
function deferred<T = void>(): {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
} {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Waits one microtask turn (lets queued .then callbacks flush). */
const tick = () => new Promise<void>((r) => setImmediate(r));

// ---------------------------------------------------------------------------
// 1. Constructor validation
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – constructor', () => {
  test('defaults to maxConcurrent=1 and unbounded queue', () => {
    const limiter = new AdmissionLimiter();
    expect(limiter.runningCount('t1')).toBe(0);
    expect(limiter.queuedCount('t1')).toBe(0);
  });

  test('throws RangeError when maxConcurrent < 1', () => {
    expect(() => new AdmissionLimiter({ maxConcurrent: 0 })).toThrow(RangeError);
  });

  test('throws RangeError when queueLimit < 0', () => {
    expect(() => new AdmissionLimiter({ queueLimit: -1 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 2. Basic immediate execution
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – immediate execution', () => {
  test('runs a single task immediately and resolves its value', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });
    const result = await limiter.run('tenant-A', async () => 42);
    expect(result).toBe(42);
  });

  test('runs up to maxConcurrent tasks in parallel', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 3 });
    const gates = [deferred(), deferred(), deferred()];
    const inFlight: number[] = [];

    const runs = gates.map((g, i) =>
      limiter.run('T', async () => {
        inFlight.push(i);
        await g.promise;
        return i;
      }),
    );

    await tick();
    expect(limiter.runningCount('T')).toBe(3);
    expect(inFlight).toEqual([0, 1, 2]);

    gates.forEach((g) => g.resolve());
    await Promise.all(runs);
  });
});

// ---------------------------------------------------------------------------
// 3. Queuing excess concurrent runs
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – queuing excess concurrent runs', () => {
  test('queues a run that exceeds the concurrency cap', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gate1 = deferred<void>();
    const gate2 = deferred<string>();

    // First run occupies the only slot.
    const run1 = limiter.run('T', () => gate1.promise);
    await tick();
    expect(limiter.runningCount('T')).toBe(1);
    expect(limiter.queuedCount('T')).toBe(0);

    // Second run must wait (uses its own gate so it won't complete instantly).
    const run2 = limiter.run('T', () => gate2.promise);
    await tick();
    expect(limiter.runningCount('T')).toBe(1);
    expect(limiter.queuedCount('T')).toBe(1);

    // Release slot 1 – run2 should be promoted.
    gate1.resolve();
    await run1;
    await tick();

    // run2 is now running (slot occupied) but its gate hasn't resolved yet.
    expect(limiter.runningCount('T')).toBe(1);
    expect(limiter.queuedCount('T')).toBe(0);

    // Now let run2 finish.
    gate2.resolve('second');
    const val = await run2;
    expect(val).toBe('second');
  });

  test('processes the queue in strict FIFO order', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gate = deferred();
    const order: number[] = [];

    // Occupy the slot.
    const first = limiter.run('T', () => gate.promise);
    await tick();

    // Enqueue 5 more tasks.
    const queued = [1, 2, 3, 4, 5].map((n) =>
      limiter.run('T', async () => {
        order.push(n);
        return n;
      }),
    );

    await tick();
    expect(limiter.queuedCount('T')).toBe(5);

    // Release the gate – all queued tasks should drain in order.
    gate.resolve();
    await first;
    const results = await Promise.all(queued);

    expect(results).toEqual([1, 2, 3, 4, 5]);
    expect(order).toEqual([1, 2, 3, 4, 5]);
  });

  test('concurrency burst: 10 runs with cap=3', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 3 });
    const maxObservedConcurrency = { value: 0 };
    let currentConcurrency = 0;
    const results: number[] = [];

    const makeTask = (n: number) => async () => {
      currentConcurrency++;
      if (currentConcurrency > maxObservedConcurrency.value) {
        maxObservedConcurrency.value = currentConcurrency;
      }
      // Simulate async work.
      await tick();
      currentConcurrency--;
      results.push(n);
      return n;
    };

    const runs = Array.from({ length: 10 }, (_, i) =>
      limiter.run('burst-tenant', makeTask(i)),
    );

    await Promise.all(runs);

    // Concurrency must never exceed the cap.
    expect(maxObservedConcurrency.value).toBeLessThanOrEqual(3);
    // All 10 tasks must complete.
    expect(results.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

// ---------------------------------------------------------------------------
// 4. Tenant isolation
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – tenant isolation', () => {
  test('each tenant has its own concurrency budget', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gateA = deferred();
    const gateB = deferred();

    // Both tenants get their own slot; neither should block the other.
    const runA = limiter.run('A', () => gateA.promise);
    const runB = limiter.run('B', () => gateB.promise);

    await tick();
    expect(limiter.runningCount('A')).toBe(1);
    expect(limiter.runningCount('B')).toBe(1);
    expect(limiter.queuedCount('A')).toBe(0);
    expect(limiter.queuedCount('B')).toBe(0);

    gateA.resolve();
    gateB.resolve();
    await Promise.all([runA, runB]);
  });

  test('excess runs on tenant A do not affect tenant B slot', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gateA1 = deferred<number>();
    const gateA2 = deferred<number>();

    // Saturate tenant A.
    limiter.run('A', () => gateA1.promise);
    limiter.run('A', () => gateA2.promise);
    await tick();

    expect(limiter.runningCount('A')).toBe(1);
    expect(limiter.queuedCount('A')).toBe(1);

    // Tenant B is unaffected.
    const bResult = await limiter.run('B', async () => 'b-ok');
    expect(bResult).toBe('b-ok');

    gateA1.resolve(1);
    gateA2.resolve(2);
  });
});

// ---------------------------------------------------------------------------
// 5. Queue limit enforcement
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – queue limit', () => {
  test('rejects when queueLimit=0 and slot is full', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1, queueLimit: 0 });
    const gate = deferred();

    limiter.run('T', () => gate.promise); // occupies the slot
    await tick();

    await expect(limiter.run('T', async () => 'x')).rejects.toBeInstanceOf(
      QueueLimitExceededError,
    );

    gate.resolve();
  });

  test('allows up to queueLimit entries in the queue', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1, queueLimit: 2 });
    const gate = deferred();

    limiter.run('T', () => gate.promise);
    await tick();

    // Two queued tasks are fine.
    const q1 = limiter.run('T', async () => 1);
    const q2 = limiter.run('T', async () => 2);
    await tick();
    expect(limiter.queuedCount('T')).toBe(2);

    // Third must be rejected.
    await expect(limiter.run('T', async () => 3)).rejects.toBeInstanceOf(
      QueueLimitExceededError,
    );

    gate.resolve();
    const results = await Promise.all([q1, q2]);
    expect(results).toEqual([1, 2]);
  });

  test('QueueLimitExceededError carries the tenant id', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1, queueLimit: 0 });
    const gate = deferred();
    limiter.run('my-tenant', () => gate.promise);
    await tick();

    try {
      await limiter.run('my-tenant', async () => {});
      fail('expected rejection');
    } catch (err) {
      expect(err).toBeInstanceOf(QueueLimitExceededError);
      expect((err as Error).message).toContain('my-tenant');
    }

    gate.resolve();
  });
});

// ---------------------------------------------------------------------------
// 6. Error propagation
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – error propagation', () => {
  test('a failing task rejects its promise and frees the slot', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const boom = new Error('task failure');

    await expect(
      limiter.run('T', async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);

    // Slot must be free now.
    expect(limiter.runningCount('T')).toBe(0);
  });

  test('a queued task still runs after a preceding task throws', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gate = deferred();

    // First task will throw.
    const run1 = limiter.run('T', async () => {
      await gate.promise;
      throw new Error('oops');
    });

    // Second task is queued.
    const run2 = limiter.run('T', async () => 'recovered');

    gate.resolve();
    await expect(run1).rejects.toThrow('oops');

    const val = await run2;
    expect(val).toBe('recovered');
  });
});

// ---------------------------------------------------------------------------
// 7. Garbage collection of tenant state
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – tenant state GC', () => {
  test('removes tenant entry after all work completes', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });

    await limiter.run('T', async () => 'done');
    await tick();

    // No running or queued work → snapshot should be empty.
    const snap = limiter.snapshot();
    expect(snap.find((s) => s.tenantId === 'T')).toBeUndefined();
  });

  test('runningCount / queuedCount return 0 for unknown tenants', () => {
    const limiter = new AdmissionLimiter();
    expect(limiter.runningCount('ghost')).toBe(0);
    expect(limiter.queuedCount('ghost')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 8. Snapshot API
// ---------------------------------------------------------------------------

describe('AdmissionLimiter – snapshot()', () => {
  test('snapshot reflects live state across multiple tenants', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const gA = deferred();
    const gB = deferred();
    const gC = deferred();

    limiter.run('A', () => gA.promise);
    limiter.run('B', () => gB.promise);
    limiter.run('B', () => gC.promise); // queued under B

    await tick();
    const snap = limiter.snapshot();

    const a = snap.find((s) => s.tenantId === 'A')!;
    const b = snap.find((s) => s.tenantId === 'B')!;

    expect(a.running).toBe(1);
    expect(a.queued).toBe(0);
    expect(b.running).toBe(1);
    expect(b.queued).toBe(1);

    gA.resolve();
    gB.resolve();
    gC.resolve();
  });
});
