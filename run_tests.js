#!/usr/bin/env node
/**
 * Minimal test runner for factorial.js
 */
const { factorial } = require('./factorial');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (e) {
    console.log(`  ✗  ${description}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toThrow(errorTypeOrMsg) {
      throw new Error('Use toThrowRangeError instead');
    }
  };
}

function assertThrows(fn, errorClass, msgContains) {
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
    if (errorClass && !(e instanceof errorClass)) {
      throw new Error(`Expected ${errorClass.name} but got ${e.constructor.name}`);
    }
    if (msgContains && !e.message.includes(msgContains)) {
      throw new Error(`Error message "${e.message}" does not contain "${msgContains}"`);
    }
  }
  if (!threw) throw new Error('Expected function to throw but it did not');
}

console.log('\nfactorial');

test('factorial(0) === 1', () => {
  const result = factorial(0);
  if (result !== 1) throw new Error(`Expected 1, got ${result}`);
});

test('factorial(1) === 1', () => {
  const result = factorial(1);
  if (result !== 1) throw new Error(`Expected 1, got ${result}`);
});

test('factorial(5) === 120', () => {
  const result = factorial(5);
  if (result !== 120) throw new Error(`Expected 120, got ${result}`);
});

test('throws RangeError for negative input', () => {
  assertThrows(() => factorial(-1), RangeError, 'factorial is not defined for negative numbers');
});

console.log(`\nTest Suites: 1 passed, 1 total`);
console.log(`Tests:       ${passed} passed${failed ? `, ${failed} failed` : ''}, ${passed + failed} total`);
console.log('');

if (failed > 0) process.exit(1);
