'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sum } = require('../src/sum');

// AC1 – sum(1, 2) returns 3
test('sum(1, 2) returns 3', () => {
  assert.strictEqual(sum(1, 2), 3);
});

// AC2 – sum(-1, 1) returns 0
test('sum(-1, 1) returns 0', () => {
  assert.strictEqual(sum(-1, 1), 0);
});

// AC3 – Non-numeric input throws a TypeError
test('sum("a", 1) throws TypeError', () => {
  assert.throws(() => sum('a', 1), TypeError);
});

test('sum(1, "b") throws TypeError', () => {
  assert.throws(() => sum(1, 'b'), TypeError);
});

test('sum(null, 1) throws TypeError', () => {
  assert.throws(() => sum(null, 1), TypeError);
});
