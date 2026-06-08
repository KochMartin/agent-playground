/**
 * Unit tests for LiveNode.
 *
 * Uses a simple synchronous fake source so tests run without timers.
 */

import { LiveNode, LiveSource, LiveFrame, LiveNodeState } from "../LiveNode.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class FakeSource implements LiveSource {
  private _dataCb: ((p: unknown) => void) | null = null;
  private _errorCb: ((c: unknown) => void) | null = null;

  onData(cb: (p: unknown) => void): void { this._dataCb = cb; }
  onError(cb: (c: unknown) => void): void { this._errorCb = cb; }

  /** Simulate a data push from the source. */
  push(payload: unknown): void { this._dataCb?.(payload); }
  /** Simulate an error from the source. */
  fail(cause: unknown): void { this._errorCb?.(cause); }

  connect(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
}

function makeNode(opts = {}): { node: LiveNode; source: FakeSource } {
  const source = new FakeSource();
  const node = new LiveNode(source, opts);
  return { node, source };
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

describe("LiveNode – state transitions", () => {
  test("initial state is idle", () => {
    const { node } = makeNode();
    expect(node.state).toBe("idle");
  });

  test("start() transitions idle → connecting → capturing", () => {
    const states: LiveNodeState[] = [];
    const { node } = makeNode();
    node.on("statechange", ({ current }) => states.push(current));
    node.start();
    expect(states).toEqual(["connecting", "capturing"]);
    expect(node.state).toBe("capturing");
  });

  test("stop() transitions capturing → stopped", () => {
    const { node } = makeNode();
    node.start();
    node.stop();
    expect(node.state).toBe("stopped");
  });

  test("start() is a no-op when already capturing", () => {
    const states: LiveNodeState[] = [];
    const { node } = makeNode();
    node.start();
    node.on("statechange", ({ current }) => states.push(current));
    node.start(); // second call – should be ignored
    expect(states).toHaveLength(0);
  });

  test("stop() is a no-op when idle", () => {
    const states: LiveNodeState[] = [];
    const { node } = makeNode();
    node.on("statechange", ({ current }) => states.push(current));
    node.stop();
    expect(states).toHaveLength(0);
  });

  test("reset() returns node to idle with empty frames", () => {
    const { node, source } = makeNode();
    node.start();
    source.push("data");
    node.reset();
    expect(node.state).toBe("idle");
    expect(node.frames).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Frame capture
// ---------------------------------------------------------------------------

describe("LiveNode – frame capture", () => {
  test("captures frames while in capturing state", () => {
    const frames: LiveFrame[] = [];
    const { node, source } = makeNode();
    node.on("frame", (f) => frames.push(f));
    node.start();
    source.push("a");
    source.push("b");
    source.push("c");
    expect(frames).toHaveLength(3);
    expect(frames.map((f) => f.payload)).toEqual(["a", "b", "c"]);
  });

  test("seq numbers are monotonically increasing from 0", () => {
    const { node, source } = makeNode();
    node.start();
    source.push(1);
    source.push(2);
    source.push(3);
    expect(node.frames.map((f) => f.seq)).toEqual([0, 1, 2]);
  });

  test("does not capture frames when stopped", () => {
    const { node, source } = makeNode();
    node.start();
    source.push("before-stop");
    node.stop();
    source.push("after-stop");
    expect(node.frames).toHaveLength(1);
    expect(node.frames[0].payload).toBe("before-stop");
  });

  test("latest returns the most recent frame", () => {
    const { node, source } = makeNode();
    node.start();
    source.push("x");
    source.push("y");
    expect(node.latest?.payload).toBe("y");
  });

  test("latest is undefined when no frames captured", () => {
    const { node } = makeNode();
    node.start();
    expect(node.latest).toBeUndefined();
  });

  test("each frame has a valid ISO timestamp", () => {
    const { node, source } = makeNode();
    node.start();
    source.push("ts-check");
    const ts = node.frames[0].timestamp;
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

// ---------------------------------------------------------------------------
// Rolling window (maxFrames)
// ---------------------------------------------------------------------------

describe("LiveNode – maxFrames rolling window", () => {
  test("retains at most maxFrames frames", () => {
    const { node, source } = makeNode({ maxFrames: 3 });
    node.start();
    for (let i = 0; i < 10; i++) source.push(i);
    expect(node.frames).toHaveLength(3);
  });

  test("keeps the newest frames when window is exceeded", () => {
    const { node, source } = makeNode({ maxFrames: 3 });
    node.start();
    for (let i = 0; i < 10; i++) source.push(i);
    expect(node.frames.map((f) => f.payload)).toEqual([7, 8, 9]);
  });
});

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

describe("LiveNode – clear()", () => {
  test("removes all frames and resets seq", () => {
    const { node, source } = makeNode();
    node.start();
    source.push("a");
    source.push("b");
    node.clear();
    expect(node.frames).toHaveLength(0);
    source.push("c");
    expect(node.frames[0].seq).toBe(0); // seq reset
  });

  test("emits cleared event", () => {
    let cleared = false;
    const { node, source } = makeNode();
    node.on("cleared", () => { cleared = true; });
    node.start();
    source.push("x");
    node.clear();
    expect(cleared).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("LiveNode – error handling", () => {
  test("source error transitions node to error state", () => {
    const { node, source } = makeNode();
    node.start();
    source.fail(new Error("boom"));
    expect(node.state).toBe("error");
  });

  test("error event contains the message", () => {
    let msg = "";
    const { node, source } = makeNode();
    node.on("error", ({ message }) => { msg = message; });
    node.start();
    source.fail(new Error("something went wrong"));
    expect(msg).toBe("something went wrong");
  });

  test("non-Error causes are converted to string message", () => {
    let msg = "";
    const { node, source } = makeNode();
    node.on("error", ({ message }) => { msg = message; });
    node.start();
    source.fail("plain string cause");
    expect(msg).toBe("plain string cause");
  });
});

// ---------------------------------------------------------------------------
// Event emitter
// ---------------------------------------------------------------------------

describe("LiveNode – event emitter", () => {
  test("off() removes a specific listener", () => {
    const calls: number[] = [];
    const { node, source } = makeNode();
    const listener = (f: LiveFrame) => calls.push(f.seq);
    node.on("frame", listener);
    node.start();
    source.push("first");
    node.off("frame", listener);
    source.push("second");
    expect(calls).toHaveLength(1);
  });
});
