'use strict';

/**
 * AcpClient – a lightweight client for the Agent Communication Protocol.
 *
 * ### Fix: race condition on concurrent initialisation
 *
 * Previously, if `init()` was called multiple times before the first call
 * resolved, every caller would race to set up the underlying transport and
 * the last writer won, leaving earlier callers with a broken session.
 *
 * The fix stores a single in-flight Promise (`_initPromise`) so that all
 * concurrent callers await the *same* initialisation work and the transport
 * is set up exactly once.
 */
class AcpClient {
  constructor(transport) {
    this._transport = transport;
    this._ready = false;
    this._initPromise = null; // guards against concurrent init() calls
  }

  /**
   * Initialise the client.  Safe to call concurrently – all callers receive
   * the same Promise and the setup logic runs exactly once.
   *
   * @returns {Promise<void>}
   */
  init() {
    if (this._ready) {
      return Promise.resolve();
    }
    if (!this._initPromise) {
      this._initPromise = this._transport
        .connect()
        .then(() => {
          this._ready = true;
        })
        .finally(() => {
          // Allow a future re-init if the connection ever drops
          this._initPromise = null;
        });
    }
    return this._initPromise;
  }

  /**
   * Send a message over the ACP channel.
   *
   * @param {object} message
   * @returns {Promise<object>} response
   */
  async send(message) {
    if (!this._ready) {
      throw new Error('AcpClient is not initialised – call init() first');
    }
    return this._transport.send(message);
  }

  /**
   * Gracefully close the underlying transport.
   *
   * @returns {Promise<void>}
   */
  async close() {
    this._ready = false;
    this._initPromise = null;
    return this._transport.disconnect();
  }
}

module.exports = { AcpClient };
