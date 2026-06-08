import {
  TenantAdmissionLimiter,
  QueueDepthExceededError,
} from "../TenantAdmissionLimiter";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns a promise that resolves after `ms` milliseconds. */
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Returns a controllable async task. */
function makeTask<T = void>(value: T) {
  let release!: () => void;
  const task = () =>
    new Promise<T>((resolve) => {
      release = () => resolve(value);
    });
  return { task, release: () => release() };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe("TenantAdmissionLimiter – construction", () => {
  it("throws when maxConcurrent < 1", () => {
    expect(() => new TenantAdmissionLimiter({ maxConcurrent: 0 })).toThrow(
      RangeError
    );
  });

  it("accepts maxConcurrent === 1", () => {
    expect(
      () => new TenantAdmissionLimiter({ maxConcurrent: 1 })
    ).not.toThrow();
  });
});

describe("TenantAdmissionLimiter – immediate execution", () => {
  it("runs a task immediately when a slot is free", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 2 });
    const result = await limiter.run("tenantA", async () => 42);
    expect(result).toBe(42);
  });

  it("propagates rejections from the task", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 2 });
    await expect(
      limiter.run("tenantA", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
  });
});

describe("TenantAdmissionLimiter – concurrency limiting", () => {
  it("does not exceed maxConcurrent active runs for a tenant", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 2 });
    const { task: t1, release: r1 } = makeTask(1);
    const { task: t2, release: r2 } = makeTask(2);
    const { task: t3, release: r3 } = makeTask(3);

    const p1 = limiter.run("tenantA", t1);
    const p2 = limiter.run("tenantA", t2);
    const p3 = limiter.run("tenantA", t3); // should be queued

    expect(limiter.activeCount("tenantA")).toBe(2);
    expect(limiter.queuedCount("tenantA")).toBe(1);

    r1(); // free a slot → t3 should be admitted
    await p1;

    // After t1 finishes, t3 should have been admitted
    await delay(0); // let microtasks settle
    expect(limiter.activeCount("tenantA")).toBe(2);
    expect(limiter.queuedCount("tenantA")).toBe(0);

    r2();
    r3();
    await Promise.all([p2, p3]);
    expect(limiter.activeCount("tenantA")).toBe(0);
  });

  it("isolates concurrency per tenant", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 1 });
    const { task: tA, release: rA } = makeTask("a");
    const { task: tB, release: rB } = makeTask("b");

    const pA = limiter.run("tenantA", tA);
    const pB = limiter.run("tenantB", tB); // different tenant – should run immediately

    expect(limiter.activeCount("tenantA")).toBe(1);
    expect(limiter.activeCount("tenantB")).toBe(1);

    rA();
    rB();
    const [a, b] = await Promise.all([pA, pB]);
    expect(a).toBe("a");
    expect(b).toBe("b");
  });
});

describe("TenantAdmissionLimiter – queue draining (burst)", () => {
  it("drains the full queue in order after a burst", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 1 });
    const order: number[] = [];

    const controllers = Array.from({ length: 5 }, (_, i) => {
      const ctrl = makeTask(i);
      return ctrl;
    });

    // Kick off 5 concurrent calls; only 1 runs at a time.
    const promises = controllers.map(({ task }, i) =>
      limiter.run("tenantX", async () => {
        const v = await task();
        order.push(v);
        return v;
      })
    );

    expect(limiter.activeCount("tenantX")).toBe(1);
    expect(limiter.queuedCount("tenantX")).toBe(4);

    // Release them one by one.
    for (const { release } of controllers) {
      release();
      await delay(0); // allow next to start
    }

    await Promise.all(promises);
    expect(order).toEqual([0, 1, 2, 3, 4]);
    expect(limiter.activeCount("tenantX")).toBe(0);
    expect(limiter.queuedCount("tenantX")).toBe(0);
  });
});

describe("TenantAdmissionLimiter – maxQueueDepth", () => {
  it("rejects runs beyond maxQueueDepth with QueueDepthExceededError", async () => {
    const limiter = new TenantAdmissionLimiter({
      maxConcurrent: 1,
      maxQueueDepth: 2,
    });

    const { task: t1, release: r1 } = makeTask(1);
    const { task: t2 } = makeTask(2);
    const { task: t3 } = makeTask(3);

    limiter.run("tenantA", t1); // running
    limiter.run("tenantA", t2); // queued slot 1
    limiter.run("tenantA", t3); // queued slot 2

    // 4th call should be rejected immediately
    await expect(
      limiter.run("tenantA", async () => 4)
    ).rejects.toBeInstanceOf(QueueDepthExceededError);

    r1();
  });

  it("QueueDepthExceededError message mentions the tenant", async () => {
    const limiter = new TenantAdmissionLimiter({
      maxConcurrent: 1,
      maxQueueDepth: 0,
    });

    const { task, release } = makeTask(1);
    limiter.run("acme-corp", task);

    await expect(
      limiter.run("acme-corp", async () => 99)
    ).rejects.toThrow(/acme-corp/);

    release();
  });
});

describe("TenantAdmissionLimiter – snapshot", () => {
  it("returns running and queued counts for every tenant", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 1 });

    const { task: tA, release: rA } = makeTask("a");
    const { task: tB1, release: rB1 } = makeTask("b1");
    const { task: tB2 } = makeTask("b2");

    limiter.run("tenantA", tA);
    limiter.run("tenantB", tB1);
    limiter.run("tenantB", tB2); // queued

    const snap = limiter.snapshot();
    expect(snap["tenantA"]).toEqual({ running: 1, queued: 0 });
    expect(snap["tenantB"]).toEqual({ running: 1, queued: 1 });

    rA();
    rB1();
  });
});

describe("TenantAdmissionLimiter – error recovery", () => {
  it("frees the slot and admits next from queue even if task throws", async () => {
    const limiter = new TenantAdmissionLimiter({ maxConcurrent: 1 });

    const { task: failingTask, release: releaseFail } = makeTask(null);
    const { task: successTask, release: releaseSuccess } = makeTask("ok");

    // Failing task occupies the only slot.
    const p1 = limiter.run("tenantA", async () => {
      await failingTask();
      throw new Error("task failed");
    });

    // Queued.
    const p2 = limiter.run("tenantA", successTask);

    expect(limiter.activeCount("tenantA")).toBe(1);
    expect(limiter.queuedCount("tenantA")).toBe(1);

    // Let the first task fail.
    releaseFail();
    await expect(p1).rejects.toThrow("task failed");

    // The second task should now be running.
    await delay(0);
    expect(limiter.activeCount("tenantA")).toBe(1);
    expect(limiter.queuedCount("tenantA")).toBe(0);

    releaseSuccess();
    await expect(p2).resolves.toBe("ok");
    expect(limiter.activeCount("tenantA")).toBe(0);
  });
});
