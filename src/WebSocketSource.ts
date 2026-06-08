/**
 * WebSocketSource – a LiveSource implementation backed by a native WebSocket.
 *
 * Each message received on the socket is forwarded as a live frame payload.
 * The implementation attempts to parse JSON payloads automatically; raw
 * strings are passed through unchanged.
 */

import { LiveSource } from "./LiveNode.js";

export interface WebSocketSourceOptions {
  /** Protocols passed to the WebSocket constructor (optional). */
  protocols?: string | string[];
  /** If true, JSON payloads are parsed automatically (default: true). */
  parseJson?: boolean;
}

export class WebSocketSource implements LiveSource {
  private readonly _url: string;
  private readonly _protocols?: string | string[];
  private readonly _parseJson: boolean;

  private _ws: WebSocket | null = null;
  private _dataCallback: ((payload: unknown) => void) | null = null;
  private _errorCallback: ((cause: unknown) => void) | null = null;

  constructor(url: string, options: WebSocketSourceOptions = {}) {
    this._url = url;
    this._protocols = options.protocols;
    this._parseJson = options.parseJson ?? true;
  }

  connect(): void {
    if (this._ws) return;

    this._ws = this._protocols
      ? new WebSocket(this._url, this._protocols)
      : new WebSocket(this._url);

    this._ws.addEventListener("message", (ev) => {
      const raw: unknown = ev.data;
      let payload: unknown = raw;
      if (this._parseJson && typeof raw === "string") {
        try {
          payload = JSON.parse(raw);
        } catch {
          // not JSON – use the raw string
        }
      }
      this._dataCallback?.(payload);
    });

    this._ws.addEventListener("error", () => {
      this._errorCallback?.(new Error(`WebSocket error on ${this._url}`));
    });

    this._ws.addEventListener("close", (ev) => {
      if (!ev.wasClean) {
        this._errorCallback?.(
          new Error(`WebSocket closed unexpectedly (code ${ev.code})`)
        );
      }
    });
  }

  disconnect(): void {
    if (!this._ws) return;
    this._ws.close(1000, "LiveNode stopped");
    this._ws = null;
  }

  onData(cb: (payload: unknown) => void): void {
    this._dataCallback = cb;
  }

  onError(cb: (cause: unknown) => void): void {
    this._errorCallback = cb;
  }
}
