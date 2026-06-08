/**
 * LiveNode – captures a continuous stream of data from a live source.
 *
 * The node subscribes to a data provider (e.g. WebSocket, EventSource, or any
 * push-based source) and exposes the captured frames through an observable
 * interface so that a UI layer can render them in real-time.
 */

export type LiveFrame = {
  /** Monotonically increasing sequence number */
  seq: number;
  /** ISO timestamp when the frame was captured */
  timestamp: string;
  /** Raw payload delivered by the source */
  payload: unknown;
};

export type LiveNodeState = "idle" | "connecting" | "capturing" | "stopped" | "error";

export type LiveNodeEventMap = {
  statechange: { previous: LiveNodeState; current: LiveNodeState };
  frame: LiveFrame;
  error: { message: string; cause?: unknown };
  cleared: void;
};

type Listener<T> = (event: T) => void;

/** Minimal typed event-emitter used internally. */
class TypedEmitter<EventMap extends Record<string, unknown>> {
  private readonly _listeners = new Map<keyof EventMap, Set<Listener<unknown>>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): this {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(listener as Listener<unknown>);
    return this;
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): this {
    this._listeners.get(event)?.delete(listener as Listener<unknown>);
    return this;
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this._listeners.get(event)?.forEach((fn) => fn(data));
  }
}

export interface LiveSource {
  /** Called once when the node wants to start receiving data. */
  connect(): void;
  /** Called when the node wants to stop receiving data. */
  disconnect(): void;
  /** Register a callback that the source calls for every new data chunk. */
  onData(cb: (payload: unknown) => void): void;
  /** Register a callback that the source calls on a fatal error. */
  onError(cb: (cause: unknown) => void): void;
}

export interface LiveNodeOptions {
  /** Maximum number of frames to retain in memory (default: 1000). */
  maxFrames?: number;
  /** Human-readable label for this node (default: "LiveNode"). */
  label?: string;
}

/**
 * Core live-capture node.
 *
 * @example
 * ```ts
 * const node = new LiveNode(mySource, { label: "sensor-1", maxFrames: 500 });
 * node.on("frame", (f) => console.log(f.seq, f.payload));
 * node.start();
 * // later …
 * node.stop();
 * ```
 */
export class LiveNode extends TypedEmitter<LiveNodeEventMap> {
  readonly label: string;
  readonly maxFrames: number;

  private _state: LiveNodeState = "idle";
  private _frames: LiveFrame[] = [];
  private _seq = 0;
  private readonly _source: LiveSource;

  constructor(source: LiveSource, options: LiveNodeOptions = {}) {
    super();
    this._source = source;
    this.label = options.label ?? "LiveNode";
    this.maxFrames = options.maxFrames ?? 1000;

    this._source.onData((payload) => this._handleData(payload));
    this._source.onError((cause) => this._handleError(cause));
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  get state(): LiveNodeState {
    return this._state;
  }

  /** Immutable snapshot of all retained frames. */
  get frames(): readonly LiveFrame[] {
    return this._frames;
  }

  /** Latest captured frame, or `undefined` if none yet. */
  get latest(): LiveFrame | undefined {
    return this._frames[this._frames.length - 1];
  }

  /** Start live capture. */
  start(): void {
    if (this._state !== "idle" && this._state !== "stopped") {
      return;
    }
    this._transition("connecting");
    try {
      this._source.connect();
      this._transition("capturing");
    } catch (err) {
      this._handleError(err);
    }
  }

  /** Stop live capture and retain all captured frames. */
  stop(): void {
    if (this._state !== "capturing" && this._state !== "connecting") {
      return;
    }
    this._source.disconnect();
    this._transition("stopped");
  }

  /** Clear all retained frames and reset the sequence counter. */
  clear(): void {
    this._frames = [];
    this._seq = 0;
    this.emit("cleared", undefined as void);
  }

  /** Stop capture and clear all frames, returning the node to idle. */
  reset(): void {
    this.stop();
    this.clear();
    this._transition("idle");
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private _handleData(payload: unknown): void {
    if (this._state !== "capturing") return;

    const frame: LiveFrame = {
      seq: this._seq++,
      timestamp: new Date().toISOString(),
      payload,
    };

    // Enforce the rolling window
    this._frames.push(frame);
    if (this._frames.length > this.maxFrames) {
      this._frames.shift();
    }

    this.emit("frame", frame);
  }

  private _handleError(cause: unknown): void {
    const message = cause instanceof Error ? cause.message : String(cause);
    this._transition("error");
    this.emit("error", { message, cause });
  }

  private _transition(next: LiveNodeState): void {
    const previous = this._state;
    this._state = next;
    if (previous !== next) {
      this.emit("statechange", { previous, current: next });
    }
  }
}
