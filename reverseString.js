/**
 * Returns the reverse of the given string.
 * @param {string} s - The input string.
 * @returns {string} The reversed string.
 */
function reverseString(s) {
  return s.split('').reverse().join('');
}

module.exports = { reverseString };
