const Queue = require('./Queue');

// ─── Happy-path operations ───────────────────────────────────────────────────

describe('Queue – happy-path operations', () => {
  let q;

  beforeEach(() => {
    q = new Queue();
  });

  test('size() returns 0 for a new queue', () => {
    expect(q.size()).toBe(0);
  });

  test('enqueue() increases size', () => {
    q.enqueue('a');
    expect(q.size()).toBe(1);
    q.enqueue('b');
    expect(q.size()).toBe(2);
  });

  test('dequeue() returns items in FIFO order', () => {
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
  });

  test('dequeue() decreases size', () => {
    q.enqueue('x');
    q.enqueue('y');
    q.dequeue();
    expect(q.size()).toBe(1);
  });

  test('peek() returns the front item without removing it', () => {
    q.enqueue('first');
    q.enqueue('second');
    expect(q.peek()).toBe('first');
    expect(q.size()).toBe(2); // size unchanged
  });

  test('size() reflects all enqueue/dequeue operations', () => {
    q.enqueue(10);
    q.enqueue(20);
    q.dequeue();
    q.enqueue(30);
    expect(q.size()).toBe(2);
  });
});

// ─── Error and edge cases ────────────────────────────────────────────────────

describe('Queue – error and edge cases', () => {
  let q;

  beforeEach(() => {
    q = new Queue();
  });

  test('dequeue() on an empty queue throws an Error', () => {
    expect(() => q.dequeue()).toThrow(Error);
    expect(() => q.dequeue()).toThrow('Queue is empty');
  });

  test('peek() on an empty queue throws an Error', () => {
    expect(() => q.peek()).toThrow(Error);
    expect(() => q.peek()).toThrow('Queue is empty');
  });

  test('size() is correct after mixed enqueue/dequeue operations', () => {
    q.enqueue('a');
    q.enqueue('b');
    q.enqueue('c');
    q.dequeue(); // removes 'a'
    q.dequeue(); // removes 'b'
    expect(q.size()).toBe(1);
    q.enqueue('d');
    expect(q.size()).toBe(2);
    q.dequeue(); // removes 'c'
    q.dequeue(); // removes 'd'
    expect(q.size()).toBe(0);
  });

  test('dequeue() after emptying queue throws again', () => {
    q.enqueue('only');
    q.dequeue();
    expect(() => q.dequeue()).toThrow('Queue is empty');
  });

  test('peek() after emptying queue throws again', () => {
    q.enqueue('only');
    q.dequeue();
    expect(() => q.peek()).toThrow('Queue is empty');
  });

  test('enqueue() accepts various value types', () => {
    q.enqueue(null);
    q.enqueue(undefined);
    q.enqueue({ key: 'val' });
    expect(q.size()).toBe(3);
    expect(q.dequeue()).toBeNull();
    expect(q.dequeue()).toBeUndefined();
    expect(q.dequeue()).toEqual({ key: 'val' });
  });
});
