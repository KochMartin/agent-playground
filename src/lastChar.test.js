const { test } = require('node:test');
const assert = require('node:assert/strict');
const { lastChar } = require('./lastChar');

test('returns the last character of a normal string', () => {
  assert.equal(lastChar('hello'), 'o');
});

test('returns the last character of a single-character string', () => {
  assert.equal(lastChar('x'), 'x');
});

test('returns an empty string when given an empty string', () => {
  assert.equal(lastChar(''), '');
});

test('works with strings containing spaces', () => {
  assert.equal(lastChar('hello world'), 'd');
});

test('works with a string that ends in a space', () => {
  assert.equal(lastChar('hello '), ' ');
});

test('works with a numeric string', () => {
  assert.equal(lastChar('12345'), '5');
});

test('works with special characters', () => {
  assert.equal(lastChar('!@#$'), '$');
});
