const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { clamp } = require('./utils');

describe('clamp()', () => {
  describe('in-range values', () => {
    it('returns the value unchanged when strictly between min and max', () => {
      assert.strictEqual(clamp(5, 0, 10), 5);
    });

    it('returns min when value equals min', () => {
      assert.strictEqual(clamp(0, 0, 10), 0);
    });

    it('returns max when value equals max', () => {
      assert.strictEqual(clamp(10, 0, 10), 10);
    });
  });

  describe('below-min values', () => {
    it('returns min when value is below min', () => {
      assert.strictEqual(clamp(-3, 0, 10), 0);
    });

    it('returns min for a large negative value', () => {
      assert.strictEqual(clamp(-1000, -5, 5), -5);
    });
  });

  describe('above-max values', () => {
    it('returns max when value exceeds max', () => {
      assert.strictEqual(clamp(15, 0, 10), 10);
    });

    it('returns max for a large positive value', () => {
      assert.strictEqual(clamp(1000, -5, 5), 5);
    });
  });

  describe('floating-point values', () => {
    it('clamps a float that is in range', () => {
      assert.ok(Math.abs(clamp(3.7, 0, 10) - 3.7) < 1e-10);
    });

    it('clamps a float below min', () => {
      assert.strictEqual(clamp(-0.1, 0, 1), 0);
    });

    it('clamps a float above max', () => {
      assert.strictEqual(clamp(1.1, 0, 1), 1);
    });
  });
});
