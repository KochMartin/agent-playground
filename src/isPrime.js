/**
 * Determines whether a given integer is a prime number.
 * Uses trial division up to the square root of n.
 *
 * @param {number} n - A positive integer >= 1
 * @returns {boolean} true if n is prime, false otherwise
 * @throws {Error} If n is not a positive integer
 */
function isPrime(n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Argument must be a positive integer');
  }
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const limit = Math.sqrt(n);
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

module.exports = { isPrime };
