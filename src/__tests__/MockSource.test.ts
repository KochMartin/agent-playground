/**
 * Unit tests for MockSource + LiveNode integration.
 */

import { LiveNode } from "../LiveNode.js";
import { MockSource } from "../MockSource.js";

describe("MockSource", () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("emits frames on an interval", () => {
    const source = new MockSource({ intervalMs: 100 });
    const node = new LiveNode(source, { label: "mock-test" });
    node.start();

    jest.advanceTimersByTime(350); // 3 ticks at 100ms
    expect(node.frames.length).toBe(3);
  });

  test("stops emitting after disconnect", () => {
    const source = new MockSource({ intervalMs: 100 });
    const node = new LiveNode(source);
    node.start();
    jest.advanceTimersByTime(250); // 2 ticks
    node.stop();
    jest.advanceTimersByTime(300); // no more ticks
    expect(node.frames.length).toBe(2);
  });

  test("custom payloadFactory is used", () => {
    const source = new MockSource({
      intervalMs: 50,
      payloadFactory: (n) => `item-${n}`,
    });
    const node = new LiveNode(source);
    node.start();
    jest.advanceTimersByTime(120); // 2 ticks
    expect(node.frames.map((f) => f.payload)).toEqual(["item-0", "item-1"]);
  });

  test("emits error after errorAfter frames", () => {
    const source = new MockSource({ intervalMs: 50, errorAfter: 2 });
    const node = new LiveNode(source);
    let errorMsg = "";
    node.on("error", ({ message }) => { errorMsg = message; });
    node.start();
    jest.advanceTimersByTime(200); // 4 ticks (error at 3rd)
    expect(node.frames.length).toBe(2);
    expect(errorMsg).toMatch(/simulated error/);
    expect(node.state).toBe("error");
  });
});
