/**
 * Returns n! (factorial) for a non-negative integer n.
 *
 * @param {number} n - A non-negative integer.
 * @returns {number} The factorial of n.
 * @throws {RangeError} If n is negative.
 */
function factorial(n) {
  if (n < 0) {
    throw new RangeError('factorial is not defined for negative numbers');
  }
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

module.exports = { factorial };
