/**
 * Queue – a simple FIFO data structure.
 */
class Queue {
  constructor() {
    this._items = [];
  }

  /** Add an item to the back of the queue. */
  enqueue(item) {
    this._items.push(item);
  }

  /**
   * Remove and return the item at the front of the queue.
   * @throws {Error} if the queue is empty.
   */
  dequeue() {
    if (this._items.length === 0) {
      throw new Error('Queue is empty');
    }
    return this._items.shift();
  }

  /**
   * Return the item at the front without removing it.
   * @throws {Error} if the queue is empty.
   */
  peek() {
    if (this._items.length === 0) {
      throw new Error('Queue is empty');
    }
    return this._items[0];
  }

  /** Return the number of items in the queue. */
  size() {
    return this._items.length;
  }
}

module.exports = Queue;
