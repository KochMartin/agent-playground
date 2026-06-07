const { test } = require('node:test');
const assert = require('node:assert/strict');
const { multiply } = require('./multiply');

// --- Happy-path tests ---

test('positive * positive', () => {
  assert.equal(multiply(3, 4), 12);
  assert.equal(multiply(7, 8), 56);
});

test('negative * positive', () => {
  assert.equal(multiply(-5, 3), -15);
  assert.equal(multiply(-1, 100), -100);
});

test('multiplication by zero', () => {
  assert.equal(multiply(0, 99), 0);
  // -7 * 0 produces -0 in IEEE 754; use == to treat -0 and +0 as equal
  assert.ok(multiply(-7, 0) == 0);
  assert.equal(multiply(0, 0), 0);
});

test('floating-point values', () => {
  assert.ok(Math.abs(multiply(0.1, 0.2) - 0.02) < 1e-10);
  assert.equal(multiply(1.5, 4), 6);
  assert.equal(multiply(2.5, 2.5), 6.25);
});

// --- Error-handling tests ---

test('throws TypeError when first argument is a string', () => {
  assert.throws(
    () => multiply('a', 2),
    TypeError
  );
});

test('throws TypeError when second argument is a string', () => {
  assert.throws(
    () => multiply(2, 'b'),
    TypeError
  );
});

test('throws TypeError when both arguments are non-numeric', () => {
  assert.throws(
    () => multiply(null, undefined),
    TypeError
  );
});

test('throws TypeError when argument is an object', () => {
  assert.throws(
    () => multiply({}, 3),
    TypeError
  );
});
