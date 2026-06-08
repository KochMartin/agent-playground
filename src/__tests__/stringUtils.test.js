/**
 * Unit tests for stringUtils.js using Node's built-in test runner.
 * Run with: node --test src/__tests__/stringUtils.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  reverse,
  capitalize,
  countVowels,
  truncate,
  slugify,
  wordCount,
} = require('../stringUtils');

// ─── reverse ─────────────────────────────────────────────────────────────────
describe('reverse', () => {
  test('reverses a simple string', () => {
    assert.equal(reverse('hello'), 'olleh');
  });
  test('reverses a palindrome unchanged', () => {
    assert.equal(reverse('racecar'), 'racecar');
  });
  test('returns empty string for empty input', () => {
    assert.equal(reverse(''), '');
  });
  test('reverses a single character', () => {
    assert.equal(reverse('a'), 'a');
  });
  test('reverses a string with spaces', () => {
    assert.equal(reverse('hello world'), 'dlrow olleh');
  });
  test('throws TypeError for non-string input', () => {
    assert.throws(() => reverse(123), TypeError);
  });
});

// ─── capitalize ──────────────────────────────────────────────────────────────
describe('capitalize', () => {
  test('capitalizes first letter of a lowercase string', () => {
    assert.equal(capitalize('hello'), 'Hello');
  });
  test('leaves already-capitalized string unchanged', () => {
    assert.equal(capitalize('Hello'), 'Hello');
  });
  test('returns empty string for empty input', () => {
    assert.equal(capitalize(''), '');
  });
  test('capitalizes single character', () => {
    assert.equal(capitalize('a'), 'A');
  });
  test('does not change the rest of the string', () => {
    assert.equal(capitalize('hELLO'), 'HELLO');
  });
  test('throws TypeError for non-string input', () => {
    assert.throws(() => capitalize(null), TypeError);
  });
});

// ─── countVowels ─────────────────────────────────────────────────────────────
describe('countVowels', () => {
  test('counts vowels in a simple string', () => {
    assert.equal(countVowels('hello'), 2);
  });
  test('returns 0 for a string with no vowels', () => {
    assert.equal(countVowels('gym'), 0);
  });
  test('returns 0 for empty string', () => {
    assert.equal(countVowels(''), 0);
  });
  test('counts uppercase vowels', () => {
    assert.equal(countVowels('AEIOU'), 5);
  });
  test('counts mixed-case vowels', () => {
    assert.equal(countVowels('Education'), 5);
  });
  test('throws TypeError for non-string input', () => {
    assert.throws(() => countVowels(42), TypeError);
  });
});

// ─── truncate ────────────────────────────────────────────────────────────────
describe('truncate', () => {
  test('returns original string when shorter than n', () => {
    assert.equal(truncate('hello', 10), 'hello');
  });
  test('returns original string when equal to n', () => {
    assert.equal(truncate('hello', 5), 'hello');
  });
  test('truncates and adds ellipsis when longer than n', () => {
    assert.equal(truncate('hello world', 5), 'hello...');
  });
  test('handles n = 0', () => {
    assert.equal(truncate('hello', 0), '...');
  });
  test('returns empty string for empty input regardless of n', () => {
    assert.equal(truncate('', 5), '');
  });
  test('throws TypeError for non-string first arg', () => {
    assert.throws(() => truncate(123, 5), TypeError);
  });
  test('throws RangeError for negative n', () => {
    assert.throws(() => truncate('hello', -1), RangeError);
  });
});

// ─── slugify ─────────────────────────────────────────────────────────────────
describe('slugify', () => {
  test('lowercases and replaces spaces with hyphens', () => {
    assert.equal(slugify('Hello World'), 'hello-world');
  });
  test('strips non-alphanumeric characters', () => {
    assert.equal(slugify('Hello, World!'), 'hello-world');
  });
  test('collapses multiple spaces', () => {
    assert.equal(slugify('foo   bar'), 'foo-bar');
  });
  test('returns empty string for empty input', () => {
    assert.equal(slugify(''), '');
  });
  test('handles numbers in the string', () => {
    assert.equal(slugify('Item 42 Final'), 'item-42-final');
  });
  test('throws TypeError for non-string input', () => {
    assert.throws(() => slugify(true), TypeError);
  });
});

// ─── wordCount ───────────────────────────────────────────────────────────────
describe('wordCount', () => {
  test('counts words in a normal sentence', () => {
    assert.equal(wordCount('hello world'), 2);
  });
  test('returns 0 for empty string', () => {
    assert.equal(wordCount(''), 0);
  });
  test('returns 0 for whitespace-only string', () => {
    assert.equal(wordCount('   '), 0);
  });
  test('counts a single word', () => {
    assert.equal(wordCount('hello'), 1);
  });
  test('handles multiple spaces between words', () => {
    assert.equal(wordCount('one  two   three'), 3);
  });
  test('throws TypeError for non-string input', () => {
    assert.throws(() => wordCount({}), TypeError);
  });
});
