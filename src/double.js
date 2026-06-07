/**
 * Returns n multiplied by 2.
 * @param {number} n - The number to double.
 * @returns {number} n * 2
 * @throws {TypeError} If n is not a number.
 */
function double(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) {
    throw new TypeError(`Expected a numeric argument, got ${typeof n}`);
  }
  return n * 2;
}

module.exports = { double };
