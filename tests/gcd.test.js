const { test } = require('node:test');
const assert = require('node:assert/strict');
const { gcd } = require('../src/gcd');

test('gcd of two equal numbers is the number itself', () => {
  assert.equal(gcd(7, 7), 7);
});

test('gcd(12, 8) = 4', () => {
  assert.equal(gcd(12, 8), 4);
});

test('gcd(48, 18) = 6', () => {
  assert.equal(gcd(48, 18), 6);
});

test('gcd is commutative: gcd(a,b) === gcd(b,a)', () => {
  assert.equal(gcd(100, 75), gcd(75, 100));
});

test('gcd where one number is 1 returns 1', () => {
  assert.equal(gcd(13, 1), 1);
});

test('gcd of two primes returns 1', () => {
  assert.equal(gcd(17, 11), 1);
});

test('gcd(0) — non-positive integer throws', () => {
  assert.throws(() => gcd(0, 5), /positive integers/);
});

test('gcd with negative number throws', () => {
  assert.throws(() => gcd(-3, 9), /positive integers/);
});

test('gcd with non-integer throws', () => {
  assert.throws(() => gcd(4.5, 9), /positive integers/);
});
