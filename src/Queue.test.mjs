import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Queue = require('./Queue.js');

// ─── Happy-path operations ───────────────────────────────────────────────────
describe('Queue – happy-path operations', () => {
  let q;

  beforeEach(() => {
    q = new Queue();
  });

  it('size() returns 0 for a new queue', () => {
    assert.equal(q.size(), 0);
  });

  it('enqueue() increases size', () => {
    q.enqueue('a');
    assert.equal(q.size(), 1);
    q.enqueue('b');
    assert.equal(q.size(), 2);
  });

  it('dequeue() returns items in FIFO order', () => {
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    assert.equal(q.dequeue(), 1);
    assert.equal(q.dequeue(), 2);
    assert.equal(q.dequeue(), 3);
  });

  it('dequeue() decreases size', () => {
    q.enqueue('x');
    q.enqueue('y');
    q.dequeue();
    assert.equal(q.size(), 1);
  });

  it('peek() returns the front item without removing it', () => {
    q.enqueue('first');
    q.enqueue('second');
    assert.equal(q.peek(), 'first');
    assert.equal(q.size(), 2);
  });

  it('size() reflects all enqueue/dequeue operations', () => {
    q.enqueue(10);
    q.enqueue(20);
    q.dequeue();
    q.enqueue(30);
    assert.equal(q.size(), 2);
  });
});

// ─── Error and edge cases ────────────────────────────────────────────────────
describe('Queue – error and edge cases', () => {
  let q;

  beforeEach(() => {
    q = new Queue();
  });

  it('dequeue() on an empty queue throws an Error', () => {
    assert.throws(() => q.dequeue(), { message: 'Queue is empty' });
  });

  it('peek() on an empty queue throws an Error', () => {
    assert.throws(() => q.peek(), { message: 'Queue is empty' });
  });

  it('size() is correct after mixed enqueue/dequeue operations', () => {
    q.enqueue('a'); q.enqueue('b'); q.enqueue('c');
    q.dequeue(); q.dequeue();
    assert.equal(q.size(), 1);
    q.enqueue('d');
    assert.equal(q.size(), 2);
    q.dequeue(); q.dequeue();
    assert.equal(q.size(), 0);
  });

  it('dequeue() after emptying queue throws again', () => {
    q.enqueue('only');
    q.dequeue();
    assert.throws(() => q.dequeue(), { message: 'Queue is empty' });
  });

  it('peek() after emptying queue throws again', () => {
    q.enqueue('only');
    q.dequeue();
    assert.throws(() => q.peek(), { message: 'Queue is empty' });
  });

  it('enqueue() accepts various value types', () => {
    q.enqueue(null);
    q.enqueue(undefined);
    q.enqueue({ key: 'val' });
    assert.equal(q.size(), 3);
    assert.equal(q.dequeue(), null);
    assert.equal(q.dequeue(), undefined);
    assert.deepEqual(q.dequeue(), { key: 'val' });
  });
});
