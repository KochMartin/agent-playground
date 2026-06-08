/**
 * MockSource – a deterministic LiveSource for tests and development.
 *
 * Emits one synthetic frame every `intervalMs` milliseconds until stopped.
 * An optional `errorAfter` count makes the source emit an error instead of
 * the next frame, which is useful for testing error-handling paths.
 */

import { LiveSource } from "./LiveNode.js";

export interface MockSourceOptions {
  /** Interval between frames in milliseconds (default: 200). */
  intervalMs?: number;
  /** Emit an error after this many frames instead of continuing (optional). */
  errorAfter?: number;
  /** Custom payload factory; receives the current frame count (default: counter object). */
  payloadFactory?: (count: number) => unknown;
}

export class MockSource implements LiveSource {
  private readonly _intervalMs: number;
  private readonly _errorAfter: number | undefined;
  private readonly _payloadFactory: (count: number) => unknown;

  private _timer: ReturnType<typeof setInterval> | null = null;
  private _count = 0;
  private _dataCallback: ((payload: unknown) => void) | null = null;
  private _errorCallback: ((cause: unknown) => void) | null = null;

  constructor(options: MockSourceOptions = {}) {
    this._intervalMs = options.intervalMs ?? 200;
    this._errorAfter = options.errorAfter;
    this._payloadFactory =
      options.payloadFactory ??
      ((n) => ({ value: Math.random(), count: n }));
  }

  connect(): void {
    this._timer = setInterval(() => {
      if (this._errorAfter !== undefined && this._count >= this._errorAfter) {
        this._errorCallback?.(
          new Error(`MockSource: simulated error after ${this._count} frames`)
        );
        this.disconnect();
        return;
      }
      this._dataCallback?.(this._payloadFactory(this._count));
      this._count++;
    }, this._intervalMs);
  }

  disconnect(): void {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  onData(cb: (payload: unknown) => void): void {
    this._dataCallback = cb;
  }

  onError(cb: (cause: unknown) => void): void {
    this._errorCallback = cb;
  }
}
