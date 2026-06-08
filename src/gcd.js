/**
 * Computes the Greatest Common Divisor of two positive integers
 * using the Euclidean algorithm.
 *
 * @param {number} a - A positive integer
 * @param {number} b - A positive integer
 * @returns {number} The greatest common divisor of a and b
 * @throws {Error} If either argument is not a positive integer
 */
function gcd(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
    throw new Error('Both arguments must be positive integers');
  }
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

module.exports = { gcd };
