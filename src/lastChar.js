/**
 * Returns the last character of string s,
 * or an empty string if s is empty.
 *
 * @param {string} s
 * @returns {string}
 */
function lastChar(s) {
  if (s.length === 0) return '';
  return s[s.length - 1];
}

module.exports = { lastChar };
