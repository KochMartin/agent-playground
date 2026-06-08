const { test } = require('node:test');
const assert = require('node:assert/strict');
const { lcm } = require('../src/lcm');

test('lcm(4, 6) = 12', () => {
  assert.equal(lcm(4, 6), 12);
});

test('lcm(12, 15) = 60', () => {
  assert.equal(lcm(12, 15), 60);
});

test('lcm of two equal numbers is the number itself', () => {
  assert.equal(lcm(9, 9), 9);
});

test('lcm is commutative: lcm(a,b) === lcm(b,a)', () => {
  assert.equal(lcm(7, 5), lcm(5, 7));
});

test('lcm where one number is 1 returns the other', () => {
  assert.equal(lcm(1, 13), 13);
  assert.equal(lcm(13, 1), 13);
});

test('lcm of two primes equals their product', () => {
  assert.equal(lcm(11, 13), 143);
});

test('lcm(21, 6) = 42', () => {
  assert.equal(lcm(21, 6), 42);
});

test('lcm with non-positive integer throws', () => {
  assert.throws(() => lcm(0, 4), /positive integers/);
});

test('lcm with negative number throws', () => {
  assert.throws(() => lcm(-2, 5), /positive integers/);
});

test('lcm with non-integer throws', () => {
  assert.throws(() => lcm(2.5, 5), /positive integers/);
});
