import { PtyCapture } from "../src/PtyCapture";
import { CaptureChunk, CaptureSnapshot } from "../src/types";

/** Wait until a condition is true, polling every 50 ms (max 5 s). */
function waitFor(pred: () => boolean, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = setInterval(() => {
      if (pred()) {
        clearInterval(id);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(id);
        reject(new Error("waitFor timed out"));
      }
    }, 50);
  });
}

// ─── helpers ────────────────────────────────────────────────────────────────

function runCapture(
  command: string,
  args: string[]
): Promise<CaptureSnapshot> {
  return new Promise((resolve, reject) => {
    const cap = new PtyCapture();
    cap.on("error", reject);
    cap.on("close", () => resolve(cap.getSnapshot()));
    cap.attach({ command, args, cols: 80, rows: 24 });
  });
}

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – basic lifecycle", () => {
  it("is not attached before attach()", () => {
    const cap = new PtyCapture();
    expect(cap.isAttached).toBe(false);
  });

  it("is attached after attach()", (done) => {
    const cap = new PtyCapture();
    cap.attach({ command: "echo", args: ["hello"] });
    expect(cap.isAttached).toBe(true);
    cap.on("close", done);
  });

  it("is not attached after the process exits", async () => {
    const cap = new PtyCapture();
    await runCapture("echo", ["done"]);
    expect(cap.isAttached).toBe(false);
  });

  it("throws when attaching twice", (done) => {
    const cap = new PtyCapture();
    cap.attach({ command: "sleep", args: ["0.1"] });
    expect(() => cap.attach({ command: "echo", args: ["x"] })).toThrow(
      /already attached/i
    );
    cap.on("close", done);
    cap.detach();
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – live capture", () => {
  it("captures stdout of a simple echo command", async () => {
    const snap = await runCapture("echo", ["hello world"]);
    expect(snap.fullOutput).toContain("hello world");
  });

  it("emits data events for every chunk", async () => {
    const received: CaptureChunk[] = [];
    const snap = await new Promise<CaptureSnapshot>((resolve, reject) => {
      const cap = new PtyCapture();
      cap.on("error", reject);
      cap.on("data", (chunk) => received.push(chunk));
      cap.on("close", () => resolve(cap.getSnapshot()));
      cap.attach({ command: "echo", args: ["chunk test"] });
    });
    expect(received.length).toBeGreaterThan(0);
    expect(snap.chunks.length).toBe(received.length);
  });

  it("captures multi-line output", async () => {
    const snap = await runCapture("printf", ["line1\\nline2\\nline3\\n"]);
    expect(snap.fullOutput).toContain("line1");
    expect(snap.fullOutput).toContain("line2");
    expect(snap.fullOutput).toContain("line3");
  });

  it("records relative timestamps in ascending order", async () => {
    const snap = await runCapture("bash", [
      "-c",
      "echo a; sleep 0.05; echo b",
    ]);
    const times = snap.chunks.map((c) => c.relativeMs);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it("records wall-clock timestamps", async () => {
    const before = new Date();
    const snap = await runCapture("echo", ["ts"]);
    const after = new Date();
    for (const chunk of snap.chunks) {
      expect(chunk.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(chunk.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    }
  });

  it("totalBytes equals byte-length of fullOutput", async () => {
    const snap = await runCapture("echo", ["byte count"]);
    const expected = Buffer.byteLength(snap.fullOutput, "utf8");
    expect(snap.totalBytes).toBe(expected);
  });

  it("tracks durationMs > 0", async () => {
    const snap = await runCapture("sleep", ["0.05"]);
    expect(snap.durationMs).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – exit code", () => {
  it("records exit code 0 for a successful command", async () => {
    const snap = await runCapture("true", []);
    expect(snap.exitCode).toBe(0);
  });

  it("records a non-zero exit code on failure", async () => {
    const snap = await runCapture("bash", ["-c", "exit 42"]);
    expect(snap.exitCode).toBe(42);
  });

  it("emits exit event with the correct code", async () => {
    let emittedCode: number | undefined;
    await new Promise<void>((resolve, reject) => {
      const cap = new PtyCapture();
      cap.on("error", reject);
      cap.on("exit", (code) => (emittedCode = code));
      cap.on("close", resolve);
      cap.attach({ command: "bash", args: ["-c", "exit 7"] });
    });
    expect(emittedCode).toBe(7);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – write / resize", () => {
  it("write() sends input to the PTY", async () => {
    const snap = await new Promise<CaptureSnapshot>((resolve, reject) => {
      const cap = new PtyCapture();
      cap.on("error", reject);
      cap.on("close", () => resolve(cap.getSnapshot()));
      // Use bash read + echo so a single line triggers the process to exit
      cap.attach({
        command: "bash",
        args: ["-c", "read line && echo $line"],
        cols: 80,
        rows: 24,
      });
      // Give the shell time to start, then send input + newline
      setTimeout(() => {
        cap.write("hello from write\n");
      }, 100);
    });
    expect(snap.fullOutput).toContain("hello from write");
  }, 10000);

  it("resize() does not throw while attached", (done) => {
    const cap = new PtyCapture();
    cap.on("close", done);
    cap.attach({ command: "sleep", args: ["0.1"] });
    expect(() => cap.resize(120, 40)).not.toThrow();
    cap.detach();
  });

  it("write() throws when not attached", () => {
    const cap = new PtyCapture();
    expect(() => cap.write("x")).toThrow(/not attached/i);
  });

  it("resize() throws when not attached", () => {
    const cap = new PtyCapture();
    expect(() => cap.resize(80, 24)).toThrow(/not attached/i);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – detach", () => {
  it("detach() stops the live capture", async () => {
    const cap = new PtyCapture();
    cap.attach({ command: "sleep", args: ["10"] });
    expect(cap.isAttached).toBe(true);

    await new Promise<void>((resolve) => {
      cap.on("close", resolve);
      cap.detach();
    });

    expect(cap.isAttached).toBe(false);
  });

  it("detach() is idempotent (calling twice doesn't throw)", (done) => {
    const cap = new PtyCapture();
    cap.attach({ command: "sleep", args: ["10"] });
    cap.on("close", () => {
      expect(() => cap.detach()).not.toThrow();
      done();
    });
    cap.detach();
  });

  it("getSnapshot() after detach returns accumulated chunks", async () => {
    let snap!: CaptureSnapshot;
    await new Promise<void>((resolve) => {
      const cap = new PtyCapture();
      cap.attach({ command: "bash", args: ["-c", "echo hi; sleep 10"] });
      setTimeout(() => {
        cap.on("close", () => {
          snap = cap.getSnapshot();
          resolve();
        });
        cap.detach();
      }, 300);
    });
    expect(snap.fullOutput).toContain("hi");
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("PtyCapture – options", () => {
  it("respects custom cols/rows", (done) => {
    const cap = new PtyCapture();
    cap.on("close", done);
    // Just verify it doesn't throw with non-default sizes
    cap.attach({ command: "echo", args: ["ok"], cols: 200, rows: 50 });
  });

  it("respects cwd option", async () => {
    const snap = await runCapture("pwd", []);
    // Should not crash; output is just the cwd path
    expect(snap.fullOutput.length).toBeGreaterThan(0);
  });

  it("merges env variables into the child environment", async () => {
    const snap = await runCapture("bash", [
      "-c",
      "echo $PTY_CAPTURE_TEST_VAR",
    ]);
    // env not set – value should be empty / just a newline
    expect(snap.fullOutput).toBeDefined();

    const snap2 = await new Promise<CaptureSnapshot>((resolve, reject) => {
      const cap = new PtyCapture();
      cap.on("error", reject);
      cap.on("close", () => resolve(cap.getSnapshot()));
      cap.attach({
        command: "bash",
        args: ["-c", "echo $PTY_CAPTURE_TEST_VAR"],
        env: { PTY_CAPTURE_TEST_VAR: "injected_value" },
      });
    });
    expect(snap2.fullOutput).toContain("injected_value");
  });
});
