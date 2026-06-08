const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isPrime } = require('../src/isPrime');

test('1 is not prime', () => {
  assert.equal(isPrime(1), false);
});

test('2 is prime', () => {
  assert.equal(isPrime(2), true);
});

test('3 is prime', () => {
  assert.equal(isPrime(3), true);
});

test('4 is not prime', () => {
  assert.equal(isPrime(4), false);
});

test('known primes are identified correctly', () => {
  const primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  for (const p of primes) {
    assert.equal(isPrime(p), true, `Expected ${p} to be prime`);
  }
});

test('known composites are identified correctly', () => {
  const composites = [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 25, 49];
  for (const c of composites) {
    assert.equal(isPrime(c), false, `Expected ${c} to be composite`);
  }
});

test('large prime 7919 is identified correctly', () => {
  assert.equal(isPrime(7919), true);
});

test('large composite 7921 (89*89) is identified correctly', () => {
  assert.equal(isPrime(7921), false);
});

test('isPrime with 0 throws', () => {
  assert.throws(() => isPrime(0), /positive integer/);
});

test('isPrime with negative number throws', () => {
  assert.throws(() => isPrime(-5), /positive integer/);
});

test('isPrime with non-integer throws', () => {
  assert.throws(() => isPrime(3.14), /positive integer/);
});
