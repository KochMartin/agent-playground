/**
 * Returns the arithmetic sum of two numbers.
 *
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} a + b
 * @throws {TypeError} if either argument is not a finite number
 */
function sum(a, b) {
  if (typeof a !== 'number' || !Number.isFinite(a)) {
    throw new TypeError(`sum() expects a finite number as first argument, got ${typeof a}`);
  }
  if (typeof b !== 'number' || !Number.isFinite(b)) {
    throw new TypeError(`sum() expects a finite number as second argument, got ${typeof b}`);
  }
  return a + b;
}

module.exports = { sum };
