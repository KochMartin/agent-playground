const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { double } = require('./double');

describe('double()', () => {
  // --- Happy path ---
  test('doubles a positive integer', () => {
    assert.equal(double(5), 10);
  });

  test('doubles a negative integer', () => {
    assert.equal(double(-3), -6);
  });

  test('doubles zero', () => {
    assert.equal(double(0), 0);
  });

  test('doubles a floating-point number', () => {
    assert.equal(double(1.5), 3);
  });

  test('doubles Infinity', () => {
    assert.equal(double(Infinity), Infinity);
  });

  // --- Error path ---
  test('throws TypeError for a string', () => {
    assert.throws(() => double('4'), TypeError);
  });

  test('throws TypeError for null', () => {
    assert.throws(() => double(null), TypeError);
  });

  test('throws TypeError for undefined', () => {
    assert.throws(() => double(undefined), TypeError);
  });

  test('throws TypeError for an object', () => {
    assert.throws(() => double({}), TypeError);
  });

  test('throws TypeError for NaN', () => {
    assert.throws(() => double(NaN), TypeError);
  });
});
