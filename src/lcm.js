/**
 * Computes the Least Common Multiple of two positive integers,
 * implemented using the GCD relationship: lcm(a, b) = |a * b| / gcd(a, b).
 *
 * @param {number} a - A positive integer
 * @param {number} b - A positive integer
 * @returns {number} The least common multiple of a and b
 * @throws {Error} If either argument is not a positive integer
 */
const { gcd } = require('./gcd');

function lcm(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
    throw new Error('Both arguments must be positive integers');
  }
  return (a / gcd(a, b)) * b;
}

module.exports = { lcm };
