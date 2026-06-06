/**
 * Unit tests for sum() — uses Node.js built-in test runner (node:test).
 * Run with: node --test src/__tests__/sum.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sum } = require('../sum');

describe('sum(a, b)', () => {
  it('AC1: sum(1, 2) returns 3', () => {
    assert.strictEqual(sum(1, 2), 3);
  });

  it('AC2: sum(-1, 1) returns 0', () => {
    assert.strictEqual(sum(-1, 1), 0);
  });

  it('AC3: non-numeric first argument throws TypeError', () => {
    assert.throws(() => sum('a', 2), TypeError);
  });

  it('AC3: non-numeric second argument throws TypeError', () => {
    assert.throws(() => sum(1, null), TypeError);
  });

  it('AC3: both arguments non-numeric throws TypeError', () => {
    assert.throws(() => sum(undefined, undefined), TypeError);
  });

  it('sum(0, 0) returns 0', () => {
    assert.strictEqual(sum(0, 0), 0);
  });

  it('sum with floating-point numbers', () => {
    assert.strictEqual(sum(1.5, 2.5), 4);
  });
});
