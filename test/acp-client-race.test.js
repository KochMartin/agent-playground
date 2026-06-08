'use strict';

/**
 * E2E tests – AcpClient race-condition fix
 *
 * Verifies that concurrent calls to AcpClient.init() do not race and that
 * the underlying transport's connect() method is invoked exactly once
 * regardless of how many callers kick off initialisation simultaneously.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AcpClient } = require('../src/acp-client');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a mock transport whose connect() resolves after `delay` ms.
 * Records the number of times connect() and disconnect() are called.
 */
function makeMockTransport({ delay = 10, shouldFail = false } = {}) {
  const calls = { connect: 0, send: 0, disconnect: 0 };
  return {
    calls,
    connect() {
      calls.connect += 1;
      return new Promise((resolve, reject) =>
        setTimeout(() => (shouldFail ? reject(new Error('connect failed')) : resolve()), delay)
      );
    },
    send(msg) {
      calls.send += 1;
      return Promise.resolve({ echo: msg });
    },
    disconnect() {
      calls.disconnect += 1;
      return Promise.resolve();
    },
  };
}

// ---------------------------------------------------------------------------
// AC1 – Single init() call connects once
// ---------------------------------------------------------------------------

test('AC1 – single init() call connects the transport exactly once', async () => {
  const transport = makeMockTransport();
  const client = new AcpClient(transport);

  await client.init();

  assert.strictEqual(transport.calls.connect, 1, 'connect() should be called exactly once');
  await client.close();
});

// ---------------------------------------------------------------------------
// AC2 – Concurrent init() calls do NOT race (connect called exactly once)
// ---------------------------------------------------------------------------

test('AC2 – concurrent init() calls resolve without racing (connect called exactly once)', async () => {
  const transport = makeMockTransport({ delay: 30 });
  const client = new AcpClient(transport);

  // Fire 10 concurrent init() calls before the first one can finish
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () => client.init())
  );

  const failed = results.filter((r) => r.status === 'rejected');
  assert.strictEqual(failed.length, 0, 'No concurrent init() call should reject');
  assert.strictEqual(
    transport.calls.connect,
    1,
    'transport.connect() must be called exactly once despite 10 concurrent init() calls'
  );

  await client.close();
});

// ---------------------------------------------------------------------------
// AC3 – Calling init() when already ready is a no-op
// ---------------------------------------------------------------------------

test('AC3 – calling init() on an already-ready client is a no-op', async () => {
  const transport = makeMockTransport();
  const client = new AcpClient(transport);

  await client.init();
  await client.init(); // second call
  await client.init(); // third call

  assert.strictEqual(
    transport.calls.connect,
    1,
    'transport.connect() must still be called exactly once after redundant init() calls'
  );

  await client.close();
});

// ---------------------------------------------------------------------------
// AC4 – send() works after successful init()
// ---------------------------------------------------------------------------

test('AC4 – send() succeeds after init()', async () => {
  const transport = makeMockTransport();
  const client = new AcpClient(transport);

  await client.init();
  const response = await client.send({ action: 'ping' });

  assert.deepEqual(response, { echo: { action: 'ping' } });
  await client.close();
});

// ---------------------------------------------------------------------------
// AC5 – send() throws before init()
// ---------------------------------------------------------------------------

test('AC5 – send() throws a descriptive error when called before init()', async () => {
  const transport = makeMockTransport();
  const client = new AcpClient(transport);

  await assert.rejects(
    () => client.send({ action: 'ping' }),
    /not initialised/i
  );
});

// ---------------------------------------------------------------------------
// AC6 – Failed init() does not leave the client in a permanently broken state
// ---------------------------------------------------------------------------

test('AC6 – after a failed init() the client can retry successfully', async () => {
  let attempt = 0;
  const transport = {
    calls: { connect: 0, disconnect: 0, send: 0 },
    connect() {
      this.calls.connect += 1;
      attempt += 1;
      if (attempt === 1) return Promise.reject(new Error('transient connect error'));
      return Promise.resolve();
    },
    send(msg) {
      this.calls.send += 1;
      return Promise.resolve({ echo: msg });
    },
    disconnect() {
      this.calls.disconnect += 1;
      return Promise.resolve();
    },
  };

  const client = new AcpClient(transport);

  // First attempt should fail
  await assert.rejects(() => client.init(), /transient connect error/);

  // Second attempt should succeed
  await client.init();
  assert.strictEqual(transport.calls.connect, 2, 'connect() should be tried again after a failure');

  const response = await client.send({ action: 'hello' });
  assert.deepEqual(response, { echo: { action: 'hello' } });

  await client.close();
});

// ---------------------------------------------------------------------------
// AC7 – close() resets state; re-init works afterwards
// ---------------------------------------------------------------------------

test('AC7 – close() resets the client; subsequent init() re-connects', async () => {
  const transport = makeMockTransport();
  const client = new AcpClient(transport);

  await client.init();
  await client.close();

  // After close the client should be un-ready
  await assert.rejects(
    () => client.send({ action: 'post-close' }),
    /not initialised/i
  );

  // Re-init should work
  await client.init();
  const response = await client.send({ action: 'post-reinit' });
  assert.deepEqual(response, { echo: { action: 'post-reinit' } });

  assert.strictEqual(transport.calls.connect, 2, 'connect() should be called twice (init + reinit)');
  await client.close();
});
