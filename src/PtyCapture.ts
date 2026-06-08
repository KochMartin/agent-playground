import { EventEmitter } from "events";
import * as pty from "node-pty";
import {
  CaptureChunk,
  CaptureSnapshot,
  PtyAttachOptions,
  PtyCaptureEvents,
} from "./types";

/**
 * PtyCapture – attach to a pseudo-terminal process and capture its live output.
 *
 * Usage
 * -----
 * ```ts
 * const capture = new PtyCapture();
 * capture.on("data", chunk => process.stdout.write(chunk.data));
 * capture.attach({ command: "bash", args: ["-c", "echo hello"] });
 * capture.on("exit", code => {
 *   console.log("exit", code);
 *   const snap = capture.getSnapshot();
 *   console.log(snap.fullOutput);
 * });
 * ```
 */
export class PtyCapture extends EventEmitter {
  private _pty: pty.IPty | null = null;
  private _chunks: CaptureChunk[] = [];
  private _attachedAt: number | null = null;
  private _stoppedAt: number | null = null;
  private _exitCode: number | null = null;
  private _encoding: BufferEncoding | null = "utf8";

  // ── TypeScript overload to get typed event signatures ─────────────────────
  on<K extends keyof PtyCaptureEvents>(
    event: K,
    listener: PtyCaptureEvents[K]
  ): this;
  on(event: string, listener: (...args: unknown[]) => void): this;
  on(event: string, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Spawn a new process inside a PTY and start capturing its output.
   * Throws if already attached.
   */
  attach(options: PtyAttachOptions): void {
    if (this._pty !== null) {
      throw new Error(
        "PtyCapture is already attached. Call detach() before re-attaching."
      );
    }

    const {
      command,
      args = [],
      cols = 80,
      rows = 24,
      cwd = process.cwd(),
      env,
      encoding = "utf8",
    } = options;

    this._encoding = encoding;
    this._attachedAt = Date.now();
    this._stoppedAt = null;
    this._exitCode = null;
    this._chunks = [];

    const mergedEnv: { [key: string]: string } = {
      ...(process.env as Record<string, string>),
      ...(env ?? {}),
    };

    const ptyProcess = pty.spawn(command, args, {
      name: "xterm-256color",
      cols,
      rows,
      cwd,
      env: mergedEnv,
    });

    this._pty = ptyProcess;

    ptyProcess.onData((raw: string) => {
      const now = Date.now();
      const relativeMs = now - (this._attachedAt ?? now);
      const chunk: CaptureChunk = {
        relativeMs,
        timestamp: new Date(now),
        data: raw,
      };
      this._chunks.push(chunk);
      this.emit("data", chunk);
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      this._exitCode = exitCode ?? null;
      this.emit("exit", exitCode ?? 0, signal ?? 0);
      this._teardown();
    });
  }

  /**
   * Write data (keystrokes / commands) into the PTY's stdin.
   */
  write(data: string): void {
    if (!this._pty) {
      throw new Error("Not attached. Call attach() first.");
    }
    this._pty.write(data);
  }

  /**
   * Resize the PTY window.
   */
  resize(cols: number, rows: number): void {
    if (!this._pty) {
      throw new Error("Not attached. Call attach() first.");
    }
    this._pty.resize(cols, rows);
  }

  /**
   * Detach from the PTY, killing the underlying process.
   */
  detach(): void {
    if (!this._pty) return;
    try {
      this._pty.kill();
    } catch {
      // Process may have already exited.
    }
    this._teardown();
  }

  /** Whether the capture is currently attached to a live PTY. */
  get isAttached(): boolean {
    return this._pty !== null;
  }

  /**
   * Return an immutable snapshot of everything captured so far.
   * Can be called while still attached or after detach.
   */
  getSnapshot(): CaptureSnapshot {
    const chunks = [...this._chunks];
    const fullOutput = chunks.map((c) => c.data).join("");
    const totalBytes = Buffer.byteLength(fullOutput, this._encoding ?? "utf8");
    const now = this._stoppedAt ?? Date.now();
    const durationMs = this._attachedAt !== null ? now - this._attachedAt : 0;
    return {
      chunks,
      fullOutput,
      totalBytes,
      durationMs,
      exitCode: this._exitCode,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  private _teardown(): void {
    if (this._stoppedAt === null) {
      this._stoppedAt = Date.now();
    }
    this._pty = null;
    this.emit("close");
  }
}
