/**
 * Clamps a value to a given range [min, max].
 *
 * @param {number} value - The input number to clamp.
 * @param {number} min   - The lower bound of the range (inclusive).
 * @param {number} max   - The upper bound of the range (inclusive).
 * @returns {number} The value bounded to [min, max].
 *
 * @example
 * clamp(5, 0, 10);  // 5
 * clamp(-3, 0, 10); // 0
 * clamp(15, 0, 10); // 10
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

module.exports = { clamp };
