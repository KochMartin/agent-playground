const { test } = require('node:test');
const assert = require('node:assert/strict');
const { clamp } = require('./clamp');

// Step 1 – value below min
test('value below min is clamped to min', () => {
  assert.strictEqual(clamp(-5, 0, 10), 0);
});

// Step 2 – value above max
test('value above max is clamped to max', () => {
  assert.strictEqual(clamp(20, 0, 10), 10);
});

// Step 3 – value within range
test('value within range is returned unchanged', () => {
  assert.strictEqual(clamp(5, 0, 10), 5);
});

// Step 4 – value equals min
test('value equal to min is returned unchanged', () => {
  assert.strictEqual(clamp(0, 0, 10), 0);
});

// Step 5 – value equals max
test('value equal to max is returned unchanged', () => {
  assert.strictEqual(clamp(10, 0, 10), 10);
});

// Step 6 – min greater than max throws RangeError
test('min > max throws RangeError', () => {
  assert.throws(() => clamp(5, 10, 0), RangeError);
});

// Step 7 – non-numeric value throws TypeError
test('non-numeric value throws TypeError', () => {
  assert.throws(() => clamp('hello', 0, 10), TypeError);
});

// Step 8 – negative range
test('negative range: value is clamped correctly', () => {
  assert.strictEqual(clamp(-15, -10, -1), -10);
  assert.strictEqual(clamp(-5, -10, -1), -5);
  assert.strictEqual(clamp(0, -10, -1), -1);
});

// Step 9 – zero boundary
test('zero boundary: clamp with min=0 and max=0 returns 0 for any value', () => {
  assert.strictEqual(clamp(-3, 0, 0), 0);
  assert.strictEqual(clamp(0, 0, 0), 0);
  assert.strictEqual(clamp(7, 0, 0), 0);
});

// Step 10 – non-numeric min throws TypeError
test('non-numeric min throws TypeError', () => {
  assert.throws(() => clamp(5, null, 10), TypeError);
});
