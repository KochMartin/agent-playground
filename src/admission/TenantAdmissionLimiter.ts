/**
 * TenantAdmissionLimiter
 *
 * Per-tenant concurrency admission control.
 * Each tenant is allowed up to `maxConcurrent` simultaneous runs.
 * Excess calls are queued and admitted automatically as slots free up.
 */

export interface AdmissionLimiterOptions {
  /** Maximum number of concurrent runs allowed per tenant. */
  maxConcurrent: number;
  /** Optional maximum queue depth per tenant (default: unlimited). */
  maxQueueDepth?: number;
}

export class QueueDepthExceededError extends Error {
  constructor(tenantId: string, depth: number) {
    super(
      `Tenant "${tenantId}" queue is full (maxQueueDepth=${depth}). ` +
        "Run rejected – shed load or increase maxQueueDepth."
    );
    this.name = "QueueDepthExceededError";
  }
}

interface QueueEntry<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  fn: () => Promise<T>;
}

interface TenantState {
  running: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queue: QueueEntry<any>[];
}

export class TenantAdmissionLimiter {
  private readonly maxConcurrent: number;
  private readonly maxQueueDepth: number;
  private readonly tenants = new Map<string, TenantState>();

  constructor(options: AdmissionLimiterOptions) {
    if (options.maxConcurrent < 1) {
      throw new RangeError("maxConcurrent must be >= 1");
    }
    this.maxConcurrent = options.maxConcurrent;
    this.maxQueueDepth = options.maxQueueDepth ?? Infinity;
  }

  /**
   * Run `fn` under the tenant's concurrency limit.
   *
   * - If the tenant has a free slot, `fn` is started immediately.
   * - Otherwise it is enqueued and will start once a slot frees up.
   * - If the queue is already at `maxQueueDepth`, the call is rejected
   *   with a `QueueDepthExceededError`.
   *
   * @returns A promise that resolves/rejects with the same value as `fn`.
   */
  run<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    const state = this.getOrCreate(tenantId);

    if (state.running < this.maxConcurrent) {
      return this.execute(tenantId, state, fn);
    }

    // Slot not available – try to queue.
    if (state.queue.length >= this.maxQueueDepth) {
      return Promise.reject(
        new QueueDepthExceededError(tenantId, this.maxQueueDepth)
      );
    }

    return new Promise<T>((resolve, reject) => {
      state.queue.push({ resolve, reject, fn });
    });
  }

  /**
   * How many runs are currently active for the given tenant.
   */
  activeCount(tenantId: string): number {
    return this.tenants.get(tenantId)?.running ?? 0;
  }

  /**
   * How many runs are currently waiting in queue for the given tenant.
   */
  queuedCount(tenantId: string): number {
    return this.tenants.get(tenantId)?.queue.length ?? 0;
  }

  /**
   * Returns a snapshot of every known tenant's admission state.
   */
  snapshot(): Record<string, { running: number; queued: number }> {
    const out: Record<string, { running: number; queued: number }> = {};
    for (const [id, state] of this.tenants) {
      out[id] = { running: state.running, queued: state.queue.length };
    }
    return out;
  }

  // ─── internal ────────────────────────────────────────────────────────────

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
    fn: () => Promise<T>
  ): Promise<T> {
    state.running++;
    return fn().then(
      (value) => {
        this.release(tenantId, state);
        return value;
      },
      (err) => {
        this.release(tenantId, state);
        throw err;
      }
    );
  }

  private release(tenantId: string, state: TenantState): void {
    state.running--;
    const next = state.queue.shift();
    if (next) {
      // Admit the next queued entry.
      this.execute(tenantId, state, next.fn).then(next.resolve, next.reject);
    }
  }
}
