/**
 * stringUtils.js
 * Six string utility functions — Requirement #71052
 */

/**
 * reverse(s) — Returns the reversed string.
 * @param {string} s
 * @returns {string}
 */
function reverse(s) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  return s.split('').reverse().join('');
}

/**
 * capitalize(s) — Capitalizes the first letter of the string (rest unchanged).
 * @param {string} s
 * @returns {string}
 */
function capitalize(s) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * countVowels(s) — Counts the number of vowel characters (a, e, i, o, u, case-insensitive).
 * @param {string} s
 * @returns {number}
 */
function countVowels(s) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  const matches = s.match(/[aeiou]/gi);
  return matches ? matches.length : 0;
}

/**
 * truncate(s, n) — Truncates s to at most n characters; appends '...' if truncated.
 * @param {string} s
 * @param {number} n  Maximum length of the result (not counting the ellipsis).
 * @returns {string}
 */
function truncate(s, n) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  if (typeof n !== 'number' || n < 0) throw new RangeError('n must be a non-negative number');
  if (s.length <= n) return s;
  return s.slice(0, n) + '...';
}

/**
 * slugify(s) — Lowercases the string, replaces spaces with hyphens, strips non-alphanumeric
 * characters (other than hyphens), and collapses consecutive hyphens.
 * @param {string} s
 * @returns {string}
 */
function slugify(s) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * wordCount(s) — Counts the number of words in the string (whitespace-delimited).
 * An empty string or all-whitespace string returns 0.
 * @param {string} s
 * @returns {number}
 */
function wordCount(s) {
  if (typeof s !== 'string') throw new TypeError('Expected a string');
  const trimmed = s.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

module.exports = { reverse, capitalize, countVowels, truncate, slugify, wordCount };
