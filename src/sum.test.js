const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sum } = require('./sum');

describe('sum(a, b)', () => {
  // AC1 – positive numbers
  it('returns 3 when called with (1, 2)', () => {
    assert.strictEqual(sum(1, 2), 3);
  });

  // AC2 – zero result
  it('returns 0 when called with (-1, 1)', () => {
    assert.strictEqual(sum(-1, 1), 0);
  });

  // Additional happy-path cases
  it('returns 0 when called with (0, 0)', () => {
    assert.strictEqual(sum(0, 0), 0);
  });

  it('handles floating-point numbers', () => {
    assert.strictEqual(sum(0.1 + 0.2, 0), 0.1 + 0.2); // identity, not equality of fractions
    assert.ok(Math.abs(sum(1.5, 2.5) - 4) < Number.EPSILON);
  });

  // AC3 – non-numeric input throws TypeError
  it('throws TypeError when first argument is a string', () => {
    assert.throws(() => sum('a', 1), TypeError);
  });

  it('throws TypeError when second argument is null', () => {
    assert.throws(() => sum(1, null), TypeError);
  });

  it('throws TypeError when both arguments are non-numeric', () => {
    assert.throws(() => sum(undefined, 'b'), TypeError);
  });

  it('throws TypeError for NaN first argument', () => {
    assert.throws(() => sum(NaN, 1), TypeError);
  });

  it('throws TypeError for Infinity second argument', () => {
    assert.throws(() => sum(1, Infinity), TypeError);
  });
});
