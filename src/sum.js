/**
 * Returns the arithmetic sum of two numbers.
 *
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @returns {number} The sum a + b.
 * @throws {TypeError} If either argument is not a number.
 */
function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError(
      `sum() expects two numbers, but received: ${typeof a}, ${typeof b}`
    );
  }
  return a + b;
}

module.exports = { sum };
