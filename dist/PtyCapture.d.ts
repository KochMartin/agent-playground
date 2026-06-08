import { EventEmitter } from "events";
import { CaptureSnapshot, PtyAttachOptions, PtyCaptureEvents } from "./types";
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
export declare class PtyCapture extends EventEmitter {
    private _pty;
    private _chunks;
    private _attachedAt;
    private _stoppedAt;
    private _exitCode;
    private _encoding;
    on<K extends keyof PtyCaptureEvents>(event: K, listener: PtyCaptureEvents[K]): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
    /**
     * Spawn a new process inside a PTY and start capturing its output.
     * Throws if already attached.
     */
    attach(options: PtyAttachOptions): void;
    /**
     * Write data (keystrokes / commands) into the PTY's stdin.
     */
    write(data: string): void;
    /**
     * Resize the PTY window.
     */
    resize(cols: number, rows: number): void;
    /**
     * Detach from the PTY, killing the underlying process.
     */
    detach(): void;
    /** Whether the capture is currently attached to a live PTY. */
    get isAttached(): boolean;
    /**
     * Return an immutable snapshot of everything captured so far.
     * Can be called while still attached or after detach.
     */
    getSnapshot(): CaptureSnapshot;
    private _teardown;
}
//# sourceMappingURL=PtyCapture.d.ts.map