/**
 * Stack – a simple LIFO (Last-In-First-Out) data structure.
 */
class Stack {
  constructor() {
    this._items = [];
  }

  /**
   * Push an item onto the top of the stack.
   * @param {*} item
   */
  push(item) {
    this._items.push(item);
  }

  /**
   * Remove and return the top item.
   * @returns {*} the top item
   * @throws {Error} if the stack is empty
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this._items.pop();
  }

  /**
   * Return the top item without removing it.
   * @returns {*} the top item
   * @throws {Error} if the stack is empty
   */
  peek() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this._items[this._items.length - 1];
  }

  /**
   * Returns true if the stack contains no items.
   * @returns {boolean}
   */
  isEmpty() {
    return this._items.length === 0;
  }
}

module.exports = Stack;
