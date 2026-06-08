"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtyCapture = void 0;
const events_1 = require("events");
const pty = __importStar(require("node-pty"));
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
class PtyCapture extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._pty = null;
        this._chunks = [];
        this._attachedAt = null;
        this._stoppedAt = null;
        this._exitCode = null;
        this._encoding = "utf8";
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Spawn a new process inside a PTY and start capturing its output.
     * Throws if already attached.
     */
    attach(options) {
        if (this._pty !== null) {
            throw new Error("PtyCapture is already attached. Call detach() before re-attaching.");
        }
        const { command, args = [], cols = 80, rows = 24, cwd = process.cwd(), env, encoding = "utf8", } = options;
        this._encoding = encoding;
        this._attachedAt = Date.now();
        this._stoppedAt = null;
        this._exitCode = null;
        this._chunks = [];
        const mergedEnv = {
            ...process.env,
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
        ptyProcess.onData((raw) => {
            const now = Date.now();
            const relativeMs = now - (this._attachedAt ?? now);
            const chunk = {
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
    write(data) {
        if (!this._pty) {
            throw new Error("Not attached. Call attach() first.");
        }
        this._pty.write(data);
    }
    /**
     * Resize the PTY window.
     */
    resize(cols, rows) {
        if (!this._pty) {
            throw new Error("Not attached. Call attach() first.");
        }
        this._pty.resize(cols, rows);
    }
    /**
     * Detach from the PTY, killing the underlying process.
     */
    detach() {
        if (!this._pty)
            return;
        try {
            this._pty.kill();
        }
        catch {
            // Process may have already exited.
        }
        this._teardown();
    }
    /** Whether the capture is currently attached to a live PTY. */
    get isAttached() {
        return this._pty !== null;
    }
    /**
     * Return an immutable snapshot of everything captured so far.
     * Can be called while still attached or after detach.
     */
    getSnapshot() {
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
    _teardown() {
        if (this._stoppedAt === null) {
            this._stoppedAt = Date.now();
        }
        this._pty = null;
        this.emit("close");
    }
}
exports.PtyCapture = PtyCapture;
//# sourceMappingURL=PtyCapture.js.map