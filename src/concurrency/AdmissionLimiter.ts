/**
 * AdmissionLimiter
 *
 * A per-tenant concurrency admission controller that queues excess runs instead
 * of rejecting them.  Each tenant gets its own independent slot budget; bursts
 * beyond that budget are held in a FIFO queue and admitted as running slots
 * become free.
 *
 * QA campaign: F4 concurrency burst — RQ071085
 */

/** Internal representation of a queued (waiting) task. */
interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export interface AdmissionLimiterOptions {
  /**
   * Maximum number of concurrently executing runs allowed per tenant.
   * Must be ≥ 1.
   */
  maxConcurrent: number;
}

export interface TenantStats {
  tenantId: string;
  active: number;
  queued: number;
}

/**
 * Per-tenant admission limiter.
 *
 * @example
 * ```ts
 * const limiter = new AdmissionLimiter({ maxConcurrent: 2 });
 *
 * const result = await limiter.run('tenant-A', async () => {
 *   // ... your work ...
 *   return 42;
 * });
 * ```
 */
export class AdmissionLimiter {
  private readonly maxConcurrent: number;

  /** Running count per tenant. */
  private readonly active = new Map<string, number>();

  /** Pending FIFO queues per tenant. */
  private readonly queues = new Map<string, QueuedTask<unknown>[]>();

  constructor(options: AdmissionLimiterOptions) {
    if (!Number.isInteger(options.maxConcurrent) || options.maxConcurrent < 1) {
      throw new RangeError(
        `maxConcurrent must be a positive integer, got ${options.maxConcurrent}`,
      );
    }
    this.maxConcurrent = options.maxConcurrent;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Submit `fn` for execution under the per-tenant concurrency limit.
   *
   * - If the tenant has a free slot the task starts immediately.
   * - Otherwise it is placed in the tenant's FIFO queue and will start once a
   *   currently-running task for that tenant completes.
   *
   * The returned Promise resolves / rejects with the same value as `fn()`.
   */
  run<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this._activeCount(tenantId) < this.maxConcurrent) {
        this._execute(tenantId, fn, resolve, reject);
      } else {
        this._enqueue(tenantId, fn, resolve, reject);
      }
    });
  }

  /** Number of currently running tasks for `tenantId`. */
  activeCount(tenantId: string): number {
    return this._activeCount(tenantId);
  }

  /** Number of tasks waiting in the queue for `tenantId`. */
  queuedCount(tenantId: string): number {
    return this.queues.get(tenantId)?.length ?? 0;
  }

  /** Snapshot stats for every tenant that currently has activity. */
  allStats(): TenantStats[] {
    const tenants = new Set([...this.active.keys(), ...this.queues.keys()]);
    return [...tenants].map(tenantId => ({
      tenantId,
      active: this.activeCount(tenantId),
      queued: this.queuedCount(tenantId),
    }));
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private _activeCount(tenantId: string): number {
    return this.active.get(tenantId) ?? 0;
  }

  private _enqueue<T>(
    tenantId: string,
    fn: () => Promise<T>,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void,
  ): void {
    if (!this.queues.has(tenantId)) {
      this.queues.set(tenantId, []);
    }
    (this.queues.get(tenantId) as QueuedTask<unknown>[]).push({
      fn: fn as () => Promise<unknown>,
      resolve: resolve as (v: unknown) => void,
      reject,
    });
  }

  private _execute<T>(
    tenantId: string,
    fn: () => Promise<T>,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void,
  ): void {
    // Claim the slot.
    this.active.set(tenantId, this._activeCount(tenantId) + 1);

    fn().then(resolve, reject).finally(() => {
      // Release the slot.
      const after = this._activeCount(tenantId) - 1;
      if (after <= 0) {
        this.active.delete(tenantId);
      } else {
        this.active.set(tenantId, after);
      }

      // Promote the next queued task if one exists.
      this._dequeue(tenantId);
    });
  }

  private _dequeue(tenantId: string): void {
    const queue = this.queues.get(tenantId);
    if (!queue || queue.length === 0) {
      this.queues.delete(tenantId);
      return;
    }

    const next = queue.shift()!;
    if (queue.length === 0) {
      this.queues.delete(tenantId);
    }

    this._execute(
      tenantId,
      next.fn as () => Promise<unknown>,
      next.resolve,
      next.reject,
    );
  }
}
