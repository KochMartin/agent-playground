/**
 * emojiLength(s)
 *
 * Returns the number of Unicode code points in a string, NOT the number of
 * UTF-16 code units that JavaScript's built-in .length property reports.
 *
 * This means a single emoji (e.g. 😀 which is U+1F600 and stored as a
 * surrogate pair in UTF-16) correctly counts as 1, not 2.
 *
 * Implementation: Array.from() iterates by Unicode code point, so its
 * resulting array's length equals the code-point count.
 *
 * @param {string} s - The input string.
 * @returns {number} Number of Unicode code points.
 */
function emojiLength(s) {
  return Array.from(s).length;
}

module.exports = { emojiLength };
