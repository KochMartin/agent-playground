/**
 * AdmissionLimiter
 *
 * Per-tenant admission limiter that enforces a maximum number of concurrent
 * "runs" per tenant.  When the concurrency cap is reached, excess runs are
 * queued and executed in FIFO order as slots become available.
 *
 * Key guarantees:
 *  - At most `maxConcurrent` runs execute simultaneously for a given tenant.
 *  - Queued runs wait until a slot is released, then are promoted automatically.
 *  - A configurable `queueLimit` rejects new runs when the backlog is full.
 *  - Tenants with no in-flight work are garbage-collected from internal state.
 */

export interface AdmissionLimiterOptions {
  /** Maximum concurrent runs allowed per tenant (default: 1). */
  maxConcurrent?: number;
  /**
   * Maximum number of runs that may wait in the queue per tenant.
   * Excess submissions beyond this limit are rejected immediately with
   * `QueueLimitExceededError` (default: Infinity – unbounded queue).
   */
  queueLimit?: number;
}

export class QueueLimitExceededError extends Error {
  constructor(tenantId: string) {
    super(
      `Admission queue limit exceeded for tenant "${tenantId}": ` +
        'too many concurrent runs are already waiting.',
    );
    this.name = 'QueueLimitExceededError';
  }
}

/** Snapshot of a tenant's current limiter state (read-only view). */
export interface TenantSnapshot {
  tenantId: string;
  running: number;
  queued: number;
}

interface QueueEntry<T> {
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

interface TenantState {
  running: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queue: QueueEntry<any>[];
}

export class AdmissionLimiter {
  private readonly maxConcurrent: number;
  private readonly queueLimit: number;
  private readonly tenants = new Map<string, TenantState>();

  constructor(options: AdmissionLimiterOptions = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 1;
    this.queueLimit = options.queueLimit ?? Infinity;

    if (this.maxConcurrent < 1) {
      throw new RangeError('maxConcurrent must be >= 1');
    }
    if (this.queueLimit < 0) {
      throw new RangeError('queueLimit must be >= 0');
    }
  }

  /**
   * Submit a task for the given tenant.
   *
   * - If the tenant has a free slot, the task runs immediately.
   * - If the tenant is at capacity, the task is queued.
   * - If the queue is also full, `QueueLimitExceededError` is thrown
   *   synchronously (the returned promise is pre-rejected).
   *
   * @param tenantId  Opaque string identifying the tenant.
   * @param task      Async factory that produces the work to run.
   * @returns         A promise that resolves/rejects with the task's outcome.
   */
  run<T>(tenantId: string, task: () => Promise<T>): Promise<T> {
    const state = this.getOrCreate(tenantId);

    if (state.running < this.maxConcurrent) {
      // Slot available – start immediately.
      return this.execute(tenantId, state, task);
    }

    // At capacity – check queue room.
    if (state.queue.length >= this.queueLimit) {
      return Promise.reject(new QueueLimitExceededError(tenantId));
    }

    // Enqueue and return a promise that resolves when the task eventually runs.
    return new Promise<T>((resolve, reject) => {
      state.queue.push({ task, resolve, reject });
    });
  }

  /** Number of currently running tasks for a tenant (0 if tenant unknown). */
  runningCount(tenantId: string): number {
    return this.tenants.get(tenantId)?.running ?? 0;
  }

  /** Number of tasks waiting in the queue for a tenant (0 if tenant unknown). */
  queuedCount(tenantId: string): number {
    return this.tenants.get(tenantId)?.queue.length ?? 0;
  }

  /** Returns a read-only snapshot for every tracked tenant. */
  snapshot(): TenantSnapshot[] {
    return Array.from(this.tenants.entries()).map(([tenantId, s]) => ({
      tenantId,
      running: s.running,
      queued: s.queue.length,
    }));
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private getOrCreate(tenantId: string): TenantState {
    let state = this.tenants.get(tenantId);
    if (!state) {
      state = { running: 0, queue: [] };
      this.tenants.set(tenantId, state);
    }
    return state;
  }

  private execute<T>(
    tenantId: string,
    state: TenantState,
    task: () => Promise<T>,
  ): Promise<T> {
    state.running++;

    return task().then(
      (value) => {
        this.onComplete(tenantId, state);
        return value;
      },
      (err: unknown) => {
        this.onComplete(tenantId, state);
        throw err;
      },
    );
  }

  private onComplete(tenantId: string, state: TenantState): void {
    state.running--;

    if (state.queue.length > 0) {
      // Promote the next waiting task.
      const next = state.queue.shift()!;
      const promise = this.execute(tenantId, state, next.task);
      promise.then(next.resolve, next.reject);
    } else if (state.running === 0) {
      // No pending work – free the tenant slot to avoid memory leaks.
      this.tenants.delete(tenantId);
    }
  }
}
