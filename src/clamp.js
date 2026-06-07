/**
 * Clamps a numeric value to the inclusive [min, max] range.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min   - The lower bound (inclusive).
 * @param {number} max   - The upper bound (inclusive).
 * @returns {number} The clamped value.
 * @throws {TypeError}  If any argument is not a finite number.
 * @throws {RangeError} If min > max.
 */
function clamp(value, min, max) {
  if (
    typeof value !== 'number' || !isFinite(value) ||
    typeof min   !== 'number' || !isFinite(min)   ||
    typeof max   !== 'number' || !isFinite(max)
  ) {
    throw new TypeError(
      `clamp() requires finite numeric arguments; received: value=${value}, min=${min}, max=${max}`
    );
  }

  if (min > max) {
    throw new RangeError(
      `clamp() requires min <= max; received min=${min}, max=${max}`
    );
  }

  return Math.min(Math.max(value, min), max);
}

module.exports = { clamp };
