/**
 * Options for spawning / attaching to a PTY process.
 */
export interface PtyAttachOptions {
  /** Executable to run inside the PTY (e.g. "bash", "python"). */
  command: string;
  /** Arguments to pass to the command. */
  args?: string[];
  /** Initial terminal column width (default: 80). */
  cols?: number;
  /** Initial terminal row height (default: 24). */
  rows?: number;
  /** Working directory for the spawned process (default: process.cwd()). */
  cwd?: string;
  /** Additional environment variables to merge into the child environment. */
  env?: Record<string, string>;
  /**
   * Encoding used to decode raw PTY bytes.
   * Set to `null` to receive raw Buffer objects via the `data` event.
   * Default: "utf8".
   */
  encoding?: BufferEncoding | null;
}

/**
 * A single captured chunk of PTY output.
 */
export interface CaptureChunk {
  /** Monotonic timestamp (ms since attach() was called). */
  relativeMs: number;
  /** Wall-clock timestamp of when the chunk was received. */
  timestamp: Date;
  /** Raw text (or base-64 if encoding was null). */
  data: string;
}

/**
 * Summary returned by PtyCapture.stop() / getSnapshot().
 */
export interface CaptureSnapshot {
  /** All chunks collected since attach(). */
  chunks: CaptureChunk[];
  /** Full concatenated output. */
  fullOutput: string;
  /** Total number of bytes captured. */
  totalBytes: number;
  /** Duration in milliseconds between attach() and stop(). */
  durationMs: number;
  /** Exit code of the PTY process, if it exited before stop(). */
  exitCode: number | null;
}

/** Events emitted by PtyCapture. */
export interface PtyCaptureEvents {
  /** Fired for every chunk of data received from the PTY. */
  data: (chunk: CaptureChunk) => void;
  /** Fired when the PTY process exits. */
  exit: (code: number, signal: number) => void;
  /** Fired when PtyCapture has been fully torn down. */
  close: () => void;
  /** Fired if an error occurs inside the PTY layer. */
  error: (err: Error) => void;
}
