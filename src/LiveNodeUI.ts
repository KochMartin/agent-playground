/**
 * LiveNodeUI – DOM-based UI component for a LiveNode.
 *
 * Renders the node state badge, a scrolling frame log, and Start / Stop /
 * Clear controls.  The component owns its own root element; callers mount it
 * by appending `ui.element` to the document.
 */

import { LiveNode, LiveFrame, LiveNodeState } from "./LiveNode.js";

const STATE_BADGE_COLORS: Record<LiveNodeState, string> = {
  idle: "#6b7280",        // grey
  connecting: "#f59e0b",  // amber
  capturing: "#10b981",   // green
  stopped: "#3b82f6",     // blue
  error: "#ef4444",       // red
};

export interface LiveNodeUIOptions {
  /** Maximum number of frame rows shown in the log (default: 50). */
  maxVisible?: number;
  /** Date/time format for the timestamp column (default: "time"). */
  timestampFormat?: "time" | "iso" | "elapsed";
  /** Callback invoked whenever the user clicks the export button. */
  onExport?: (frames: readonly LiveFrame[]) => void;
}

export class LiveNodeUI {
  readonly element: HTMLElement;

  private readonly _node: LiveNode;
  private readonly _opts: Required<LiveNodeUIOptions>;

  private _root!: HTMLElement;
  private _badge!: HTMLElement;
  private _startBtn!: HTMLButtonElement;
  private _stopBtn!: HTMLButtonElement;
  private _clearBtn!: HTMLButtonElement;
  private _exportBtn!: HTMLButtonElement;
  private _logBody!: HTMLElement;
  private _startedAt: number | null = null;

  constructor(node: LiveNode, options: LiveNodeUIOptions = {}) {
    this._node = node;
    this._opts = {
      maxVisible: options.maxVisible ?? 50,
      timestampFormat: options.timestampFormat ?? "time",
      onExport: options.onExport ?? ((frames) => this._defaultExport(frames)),
    };

    this.element = this._build();
    this._syncState(node.state);
    this._bindNodeEvents();
  }

  // ------------------------------------------------------------------
  // Private – DOM construction
  // ------------------------------------------------------------------

  private _build(): HTMLElement {
    const root = document.createElement("div");
    root.className = "live-node-ui";
    root.setAttribute("data-label", this._node.label);
    root.innerHTML = `
      <div class="lnu-header">
        <span class="lnu-label"></span>
        <span class="lnu-badge"></span>
      </div>
      <div class="lnu-toolbar">
        <button class="lnu-btn lnu-btn--start">▶ Start</button>
        <button class="lnu-btn lnu-btn--stop">■ Stop</button>
        <button class="lnu-btn lnu-btn--clear">✕ Clear</button>
        <button class="lnu-btn lnu-btn--export">⬇ Export</button>
      </div>
      <div class="lnu-log">
        <div class="lnu-log-header">
          <span class="lnu-col-seq">#</span>
          <span class="lnu-col-ts">Timestamp</span>
          <span class="lnu-col-payload">Payload</span>
        </div>
        <div class="lnu-log-body"></div>
      </div>
    `;

    this._root = root;
    (root.querySelector(".lnu-label") as HTMLElement).textContent = this._node.label;
    this._badge = root.querySelector(".lnu-badge") as HTMLElement;
    this._startBtn = root.querySelector(".lnu-btn--start") as HTMLButtonElement;
    this._stopBtn = root.querySelector(".lnu-btn--stop") as HTMLButtonElement;
    this._clearBtn = root.querySelector(".lnu-btn--clear") as HTMLButtonElement;
    this._exportBtn = root.querySelector(".lnu-btn--export") as HTMLButtonElement;
    this._logBody = root.querySelector(".lnu-log-body") as HTMLElement;

    this._startBtn.addEventListener("click", () => {
      this._startedAt = Date.now();
      this._node.start();
    });
    this._stopBtn.addEventListener("click", () => this._node.stop());
    this._clearBtn.addEventListener("click", () => this._node.clear());
    this._exportBtn.addEventListener("click", () =>
      this._opts.onExport(this._node.frames)
    );

    return root;
  }

  // ------------------------------------------------------------------
  // Private – node event binding
  // ------------------------------------------------------------------

  private _bindNodeEvents(): void {
    this._node.on("statechange", ({ current }) => this._syncState(current));
    this._node.on("frame", (frame) => this._appendRow(frame));
    this._node.on("cleared", () => this._clearLog());
    this._node.on("error", ({ message }) => this._showError(message));
  }

  // ------------------------------------------------------------------
  // Private – UI updates
  // ------------------------------------------------------------------

  private _syncState(state: LiveNodeState): void {
    const color = STATE_BADGE_COLORS[state];
    this._badge.textContent = state.toUpperCase();
    this._badge.style.background = color;

    this._startBtn.disabled = state === "capturing" || state === "connecting";
    this._stopBtn.disabled = state !== "capturing" && state !== "connecting";
    this._exportBtn.disabled = this._node.frames.length === 0;
  }

  private _appendRow(frame: LiveFrame): void {
    const row = document.createElement("div");
    row.className = "lnu-log-row";
    row.innerHTML = `
      <span class="lnu-col-seq">${frame.seq}</span>
      <span class="lnu-col-ts">${this._formatTs(frame)}</span>
      <span class="lnu-col-payload">${this._formatPayload(frame.payload)}</span>
    `;
    this._logBody.appendChild(row);

    // Enforce visible limit
    while (this._logBody.children.length > this._opts.maxVisible) {
      this._logBody.removeChild(this._logBody.firstChild!);
    }

    // Keep the log scrolled to the bottom
    this._logBody.scrollTop = this._logBody.scrollHeight;

    // Update export button
    this._exportBtn.disabled = false;
  }

  private _clearLog(): void {
    this._logBody.innerHTML = "";
    this._exportBtn.disabled = true;
    this._syncState(this._node.state);
  }

  private _showError(message: string): void {
    const row = document.createElement("div");
    row.className = "lnu-log-row lnu-log-row--error";
    row.textContent = `⚠ Error: ${message}`;
    this._logBody.appendChild(row);
  }

  // ------------------------------------------------------------------
  // Private – formatting helpers
  // ------------------------------------------------------------------

  private _formatTs(frame: LiveFrame): string {
    switch (this._opts.timestampFormat) {
      case "iso":
        return frame.timestamp;
      case "elapsed": {
        const elapsed = this._startedAt
          ? Date.parse(frame.timestamp) - this._startedAt
          : 0;
        return `+${elapsed}ms`;
      }
      case "time":
      default: {
        const d = new Date(frame.timestamp);
        return d.toLocaleTimeString(undefined, { hour12: false });
      }
    }
  }

  private _formatPayload(payload: unknown): string {
    if (typeof payload === "string") return payload;
    try {
      return JSON.stringify(payload);
    } catch {
      return String(payload);
    }
  }

  private _defaultExport(frames: readonly LiveFrame[]): void {
    const json = JSON.stringify(frames, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this._node.label}-capture-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
