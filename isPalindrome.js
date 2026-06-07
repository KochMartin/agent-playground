/**
 * Determines whether a string is a palindrome.
 * Comparison is case-insensitive; only considers the characters as-is.
 *
 * @param {string} s - The string to test.
 * @returns {boolean} true if `s` is a palindrome, false otherwise.
 */
function isPalindrome(s) {
  if (typeof s !== 'string') {
    throw new TypeError('isPalindrome expects a string argument');
  }
  const lower = s.toLowerCase();
  const reversed = [...lower].reverse().join('');
  return lower === reversed;
}

module.exports = { isPalindrome };
