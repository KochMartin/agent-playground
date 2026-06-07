const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const Stack = require('./Stack');

describe('Stack', () => {
  // ── isEmpty ────────────────────────────────────────────────────────────────
  describe('isEmpty()', () => {
    it('returns true on a new stack', () => {
      const stack = new Stack();
      assert.equal(stack.isEmpty(), true);
    });

    it('returns false after a push', () => {
      const stack = new Stack();
      stack.push(42);
      assert.equal(stack.isEmpty(), false);
    });

    it('returns true again after all items are popped', () => {
      const stack = new Stack();
      stack.push(1);
      stack.pop();
      assert.equal(stack.isEmpty(), true);
    });
  });

  // ── push / pop (LIFO) ──────────────────────────────────────────────────────
  describe('push() and pop() – LIFO order', () => {
    it('single push then pop returns the same item', () => {
      const stack = new Stack();
      stack.push('hello');
      assert.equal(stack.pop(), 'hello');
    });

    it('multiple pushes then pops return items in LIFO order', () => {
      const stack = new Stack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      assert.equal(stack.pop(), 3);
      assert.equal(stack.pop(), 2);
      assert.equal(stack.pop(), 1);
    });
  });

  // ── peek ──────────────────────────────────────────────────────────────────
  describe('peek()', () => {
    it('returns the top element without removing it', () => {
      const stack = new Stack();
      stack.push('a');
      stack.push('b');
      assert.equal(stack.peek(), 'b');
      // Stack still has both items
      assert.equal(stack.pop(), 'b');
      assert.equal(stack.pop(), 'a');
    });
  });

  // ── error cases ───────────────────────────────────────────────────────────
  describe('error cases on empty stack', () => {
    it('pop() on an empty stack throws an Error', () => {
      const stack = new Stack();
      assert.throws(() => stack.pop(), { message: 'Stack is empty' });
    });

    it('peek() on an empty stack throws an Error', () => {
      const stack = new Stack();
      assert.throws(() => stack.peek(), { message: 'Stack is empty' });
    });
  });
});
