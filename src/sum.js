/**
 * Returns the arithmetic sum of two numbers.
 *
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @returns {number} a + b
 * @throws {TypeError} If either argument is not a number.
 */
function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  return a + b;
}

module.exports = { sum };
