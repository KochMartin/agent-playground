/**
 * mathUtils.js
 * A collection of small mathematical utility functions.
 */

/**
 * Clamps a numeric value between a minimum and maximum bound.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min   - The lower bound (inclusive).
 * @param {number} max   - The upper bound (inclusive).
 * @returns {number} The clamped value.
 *
 * @throws {TypeError}  If any argument is not a finite number.
 * @throws {RangeError} If min is greater than max.
 */
function clamp(value, min, max) {
  if (
    typeof value !== 'number' || !Number.isFinite(value) ||
    typeof min   !== 'number' || !Number.isFinite(min)   ||
    typeof max   !== 'number' || !Number.isFinite(max)
  ) {
    throw new TypeError(
      'clamp: all arguments (value, min, max) must be finite numbers'
    );
  }

  if (min > max) {
    throw new RangeError(
      `clamp: min (${min}) must not be greater than max (${max})`
    );
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * Returns the factorial of a non-negative integer n (n!).
 *
 * @param {number} n - A non-negative integer.
 * @returns {number} n!
 *
 * @throws {TypeError}  If n is not a number or is not an integer.
 * @throws {RangeError} If n is negative.
 */
function factorial(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new TypeError(
      'factorial: argument must be a finite integer'
    );
  }

  if (n < 0) {
    throw new RangeError(
      `factorial: argument must be a non-negative integer, got ${n}`
    );
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

module.exports = { clamp, factorial };
