'use strict';
/**
 * Unit tests for mathUtils.js
 * Compatible with Node.js built-in test runner (node:test + node:assert)
 * AND Jest (describe/test globals are supported in both environments).
 *
 * Run with:  node --test src/mathUtils.test.js
 *       or:  npx jest src/mathUtils.test.js
 */

const { describe, it, test } = require('node:test');
const assert = require('node:assert/strict');
const { clamp, factorial } = require('./mathUtils');

// ──────────────────────────────────────────────────────────────────────────────
// clamp()
// ──────────────────────────────────────────────────────────────────────────────
describe('clamp – valid inputs (behaviour unchanged)', () => {
  test('returns value unchanged when inside range', () => {
    assert.equal(clamp(5, 1, 10), 5);
  });

  test('returns min when value is below range', () => {
    assert.equal(clamp(-3, 0, 100), 0);
  });

  test('returns max when value is above range', () => {
    assert.equal(clamp(200, 0, 100), 100);
  });

  test('returns value equal to min (boundary)', () => {
    assert.equal(clamp(0, 0, 10), 0);
  });

  test('returns value equal to max (boundary)', () => {
    assert.equal(clamp(10, 0, 10), 10);
  });

  test('works with negative ranges', () => {
    assert.equal(clamp(-5, -10, -1), -5);
  });

  test('works with floating-point numbers', () => {
    assert.equal(clamp(1.5, 1.0, 2.0), 1.5);
  });
});

describe('clamp – TypeError for wrong-typed inputs', () => {
  test('throws TypeError when value is a string', () => {
    assert.throws(() => clamp('5', 0, 10), TypeError);
  });

  test('throws TypeError when min is null', () => {
    assert.throws(() => clamp(5, null, 10), TypeError);
  });

  test('throws TypeError when max is undefined', () => {
    assert.throws(() => clamp(5, 0, undefined), TypeError);
  });

  test('throws TypeError when value is NaN', () => {
    assert.throws(() => clamp(NaN, 0, 10), TypeError);
  });

  test('throws TypeError when value is Infinity', () => {
    assert.throws(() => clamp(Infinity, 0, 10), TypeError);
  });

  test('throws TypeError when max is an object', () => {
    assert.throws(() => clamp(5, 0, {}), TypeError);
  });

  test('TypeError message is descriptive', () => {
    assert.throws(
      () => clamp('bad', 0, 10),
      (err) => {
        assert.ok(err instanceof TypeError);
        assert.match(err.message, /clamp: all arguments.*must be finite numbers/);
        return true;
      }
    );
  });
});

describe('clamp – RangeError when min > max', () => {
  test('throws RangeError when min > max', () => {
    assert.throws(() => clamp(5, 10, 0), RangeError);
  });

  test('RangeError message mentions min and max', () => {
    assert.throws(
      () => clamp(5, 10, 0),
      (err) => {
        assert.ok(err instanceof RangeError);
        assert.match(err.message, /min.*10.*max.*0/);
        return true;
      }
    );
  });

  test('does NOT throw when min === max', () => {
    assert.doesNotThrow(() => clamp(5, 5, 5));
    assert.equal(clamp(5, 5, 5), 5);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// factorial()
// ──────────────────────────────────────────────────────────────────────────────
describe('factorial – valid inputs (behaviour unchanged)', () => {
  test('0! = 1', () => {
    assert.equal(factorial(0), 1);
  });

  test('1! = 1', () => {
    assert.equal(factorial(1), 1);
  });

  test('5! = 120', () => {
    assert.equal(factorial(5), 120);
  });

  test('10! = 3628800', () => {
    assert.equal(factorial(10), 3628800);
  });
});

describe('factorial – TypeError for wrong-typed inputs', () => {
  test('throws TypeError when argument is a string', () => {
    assert.throws(() => factorial('5'), TypeError);
  });

  test('throws TypeError when argument is a float', () => {
    assert.throws(() => factorial(2.5), TypeError);
  });

  test('throws TypeError when argument is NaN', () => {
    assert.throws(() => factorial(NaN), TypeError);
  });

  test('throws TypeError when argument is null', () => {
    assert.throws(() => factorial(null), TypeError);
  });

  test('TypeError message is descriptive', () => {
    assert.throws(
      () => factorial('x'),
      (err) => {
        assert.ok(err instanceof TypeError);
        assert.match(err.message, /factorial: argument must be a finite integer/);
        return true;
      }
    );
  });
});

describe('factorial – RangeError for negative inputs', () => {
  test('throws RangeError for -1', () => {
    assert.throws(() => factorial(-1), RangeError);
  });

  test('throws RangeError for -100', () => {
    assert.throws(() => factorial(-100), RangeError);
  });

  test('RangeError message mentions the invalid value', () => {
    assert.throws(
      () => factorial(-3),
      (err) => {
        assert.ok(err instanceof RangeError);
        assert.match(err.message, /-3/);
        return true;
      }
    );
  });
});
