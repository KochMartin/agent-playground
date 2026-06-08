/**
 * AdmissionLimiter — test suite
 *
 * QA campaign F4 concurrency burst (RQ071085):
 * Proves that the per-tenant admission limiter queues excess concurrent runs.
 */

import { AdmissionLimiter } from './AdmissionLimiter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a [promise, resolve, reject] triple for manual control. */
function deferred<T = void>(): [Promise<T>, (v: T) => void, (e: unknown) => void] {
  let res!: (v: T) => void;
  let rej!: (e: unknown) => void;
  const p = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  return [p, res, rej];
}

/** Resolves after `ms` milliseconds. */
const tick = (ms = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Constructor validation
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — constructor', () => {
  it('accepts a valid maxConcurrent value', () => {
    expect(() => new AdmissionLimiter({ maxConcurrent: 1 })).not.toThrow();
    expect(() => new AdmissionLimiter({ maxConcurrent: 10 })).not.toThrow();
  });

  it('throws RangeError for maxConcurrent < 1', () => {
    expect(() => new AdmissionLimiter({ maxConcurrent: 0 })).toThrow(RangeError);
    expect(() => new AdmissionLimiter({ maxConcurrent: -1 })).toThrow(RangeError);
  });

  it('throws RangeError for non-integer maxConcurrent', () => {
    expect(() => new AdmissionLimiter({ maxConcurrent: 1.5 })).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Basic execution
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — basic execution', () => {
  it('runs a task and returns its resolved value', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });
    const result = await limiter.run('tenant-A', async () => 42);
    expect(result).toBe(42);
  });

  it('propagates task rejections to the caller', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });
    await expect(
      limiter.run('tenant-A', () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom');
  });

  it('runs tasks below the limit without queuing', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 3 });
    const [p1, res1] = deferred<number>();
    const [p2, res2] = deferred<number>();

    const r1 = limiter.run('T', () => p1);
    const r2 = limiter.run('T', () => p2);

    // Both should be active, none queued.
    expect(limiter.activeCount('T')).toBe(2);
    expect(limiter.queuedCount('T')).toBe(0);

    res1(1);
    res2(2);

    expect(await r1).toBe(1);
    expect(await r2).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Core: queuing excess concurrent runs  (F4 burst)
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — queuing excess concurrent runs (F4 burst)', () => {
  it('queues the 3rd run when maxConcurrent=2', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });

    const [p1, res1] = deferred<string>();
    const [p2, res2] = deferred<string>();
    const [p3, res3] = deferred<string>();

    limiter.run('burst-tenant', () => p1);
    limiter.run('burst-tenant', () => p2);
    // Third call must be queued because both slots are taken.
    limiter.run('burst-tenant', () => p3);

    expect(limiter.activeCount('burst-tenant')).toBe(2);
    expect(limiter.queuedCount('burst-tenant')).toBe(1);

    res1('a');
    res2('b');
    res3('c');
  });

  it('queues all tasks beyond the concurrency limit', async () => {
    const MAX = 2;
    const TOTAL = 7;
    const limiter = new AdmissionLimiter({ maxConcurrent: MAX });
    const controls: Array<[Promise<number>, (v: number) => void]> = [];

    for (let i = 0; i < TOTAL; i++) {
      const [p, res] = deferred<number>();
      controls.push([p, res]);
      limiter.run('burst-tenant', () => p);
    }

    // After submitting all, exactly MAX should be active and the rest queued.
    expect(limiter.activeCount('burst-tenant')).toBe(MAX);
    expect(limiter.queuedCount('burst-tenant')).toBe(TOTAL - MAX);

    // Drain all.
    controls.forEach(([, res], i) => res(i));
    await tick(20);

    expect(limiter.activeCount('burst-tenant')).toBe(0);
    expect(limiter.queuedCount('burst-tenant')).toBe(0);
  });

  it('promotes a queued task when an active slot is freed', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });

    const [p1, res1] = deferred<string>();
    const [p2, res2] = deferred<string>();

    const r1 = limiter.run('T', () => p1);
    const r2 = limiter.run('T', () => p2);

    // p2 must be queued.
    expect(limiter.activeCount('T')).toBe(1);
    expect(limiter.queuedCount('T')).toBe(1);

    // Free the first slot.
    res1('first');
    await tick(); // let the microtask queue flush

    // p2 should now be active.
    expect(limiter.activeCount('T')).toBe(1);
    expect(limiter.queuedCount('T')).toBe(0);

    res2('second');
    expect(await r1).toBe('first');
    expect(await r2).toBe('second');
  });

  it('FIFO ordering: queued tasks start in submission order', async () => {
    const MAX = 1;
    const limiter = new AdmissionLimiter({ maxConcurrent: MAX });
    const order: number[] = [];

    const [blocker, releaseBlocker] = deferred<void>();

    // First task holds the slot.
    limiter.run('T', () => blocker);

    // Enqueue tasks 1–4; they should start in order 1, 2, 3, 4.
    const makeTask = (id: number) => () =>
      new Promise<void>(resolve => {
        order.push(id);
        resolve();
      });

    const promises = [1, 2, 3, 4].map(id => limiter.run('T', makeTask(id)));

    // Release blocker so queued tasks can start one by one.
    releaseBlocker();
    await Promise.all(promises);

    expect(order).toEqual([1, 2, 3, 4]);
  });
});

// ---------------------------------------------------------------------------
// Tenant isolation
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — tenant isolation', () => {
  it('limits each tenant independently', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });

    const [pA, resA] = deferred<string>();
    const [pB, resB] = deferred<string>();

    limiter.run('tenantA', () => pA);
    limiter.run('tenantB', () => pB);

    // Each tenant has its own slot budget.
    expect(limiter.activeCount('tenantA')).toBe(1);
    expect(limiter.activeCount('tenantB')).toBe(1);
    expect(limiter.queuedCount('tenantA')).toBe(0);
    expect(limiter.queuedCount('tenantB')).toBe(0);

    resA('a');
    resB('b');
  });

  it('queuing for tenant-A does not affect tenant-B slots', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });

    const [pA1] = deferred<void>();
    const [pA2] = deferred<void>();
    const [pB, resB] = deferred<string>();

    // Saturate tenant-A and queue one extra.
    limiter.run('tenantA', () => pA1);
    limiter.run('tenantA', () => pA2);

    // tenant-B has a free slot.
    const rB = limiter.run('tenantB', () => pB);

    expect(limiter.activeCount('tenantA')).toBe(1);
    expect(limiter.queuedCount('tenantA')).toBe(1);
    expect(limiter.activeCount('tenantB')).toBe(1);
    expect(limiter.queuedCount('tenantB')).toBe(0);

    resB('b');
    expect(await rB).toBe('b');
  });
});

// ---------------------------------------------------------------------------
// Error resilience
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — error resilience', () => {
  it('frees a slot even when a task rejects', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });

    const [pOk, resOk] = deferred<string>();

    // First task will reject.
    const failing = limiter.run('T', () => Promise.reject(new Error('fail'))).catch(() => {});
    // Second task queued.
    const r2 = limiter.run('T', () => pOk);

    await failing; // rejection is caught above
    await tick();  // let the slot release propagate

    expect(limiter.activeCount('T')).toBe(1); // r2 now running
    expect(limiter.queuedCount('T')).toBe(0);

    resOk('ok');
    expect(await r2).toBe('ok');
  });

  it('continues processing the queue after an intermediate rejection', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    const results: string[] = [];

    const [blocker, releaseBlocker] = deferred<void>();
    limiter.run('T', () => blocker);

    // Enqueue: fail, succeed, succeed.
    const p1 = limiter
      .run('T', () => Promise.reject(new Error('middle-fail')))
      .catch(() => results.push('ERR'));
    const p2 = limiter.run('T', async () => { results.push('ok2'); });
    const p3 = limiter.run('T', async () => { results.push('ok3'); });

    releaseBlocker();
    await Promise.all([p1, p2, p3]);

    expect(results).toEqual(['ERR', 'ok2', 'ok3']);
  });
});

// ---------------------------------------------------------------------------
// allStats helper
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — allStats()', () => {
  it('returns combined stats for all active tenants', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });

    const [pA] = deferred<void>();
    const [pA2] = deferred<void>();
    const [pB] = deferred<void>();

    limiter.run('alpha', () => pA);
    limiter.run('alpha', () => pA2); // queued
    limiter.run('beta', () => pB);

    const stats = limiter.allStats().sort((a, b) => a.tenantId.localeCompare(b.tenantId));

    expect(stats).toEqual([
      { tenantId: 'alpha', active: 1, queued: 1 },
      { tenantId: 'beta',  active: 1, queued: 0 },
    ]);
  });

  it('returns an empty array when no tenants are active', () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 2 });
    expect(limiter.allStats()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Stress / burst
// ---------------------------------------------------------------------------

describe('AdmissionLimiter — burst stress test', () => {
  it('correctly serialises 50 tasks through a single slot', async () => {
    const limiter = new AdmissionLimiter({ maxConcurrent: 1 });
    let concurrentPeak = 0;
    let running = 0;
    const N = 50;

    const tasks = Array.from({ length: N }, (_, i) =>
      limiter.run('stress', async () => {
        running++;
        if (running > concurrentPeak) concurrentPeak = running;
        await tick(1);
        running--;
        return i;
      }),
    );

    const results = await Promise.all(tasks);

    expect(concurrentPeak).toBe(1);
    expect(results).toEqual(Array.from({ length: N }, (_, i) => i));
  });

  it('respects maxConcurrent=5 under a 30-task burst', async () => {
    const MAX = 5;
    const limiter = new AdmissionLimiter({ maxConcurrent: MAX });
    let concurrentPeak = 0;
    let running = 0;

    const tasks = Array.from({ length: 30 }, () =>
      limiter.run('burst5', async () => {
        running++;
        if (running > concurrentPeak) concurrentPeak = running;
        await tick(5);
        running--;
      }),
    );

    await Promise.all(tasks);
    expect(concurrentPeak).toBeLessThanOrEqual(MAX);
  });
});
