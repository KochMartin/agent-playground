/**
 * Multiplies two numbers together.
 *
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The product of a and b.
 * @throws {TypeError} If either argument is not a number.
 */
function multiply(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError(
      `multiply() expects two numbers, but received: ${typeof a}, ${typeof b}`
    );
  }
  return a * b;
}

module.exports = { multiply };
