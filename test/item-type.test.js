'use strict';

/**
 * E2E tests – item type fix
 *
 * Verifies that resolveItemType() correctly normalises raw type strings from
 * the aqua API (and from user input) to canonical ITEM_TYPES constants,
 * including all accepted case variants and aliases.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ITEM_TYPES, resolveItemType, isValidItemType } = require('../src/item-type-handler');

// ---------------------------------------------------------------------------
// AC1 – Canonical casing resolves correctly
// ---------------------------------------------------------------------------

test('AC1 – "Requirement" resolves to ITEM_TYPES.REQUIREMENT', () => {
  assert.strictEqual(resolveItemType('Requirement'), ITEM_TYPES.REQUIREMENT);
});

test('AC1 – "TestCase" resolves to ITEM_TYPES.TEST_CASE', () => {
  assert.strictEqual(resolveItemType('TestCase'), ITEM_TYPES.TEST_CASE);
});

test('AC1 – "Defect" resolves to ITEM_TYPES.DEFECT', () => {
  assert.strictEqual(resolveItemType('Defect'), ITEM_TYPES.DEFECT);
});

test('AC1 – "Task" resolves to ITEM_TYPES.TASK', () => {
  assert.strictEqual(resolveItemType('Task'), ITEM_TYPES.TASK);
});

test('AC1 – "Epic" resolves to ITEM_TYPES.EPIC', () => {
  assert.strictEqual(resolveItemType('Epic'), ITEM_TYPES.EPIC);
});

// ---------------------------------------------------------------------------
// AC2 – Case-insensitive variants resolve correctly (the core fix)
// ---------------------------------------------------------------------------

test('AC2 – "requirement" (all lower) resolves to ITEM_TYPES.REQUIREMENT', () => {
  assert.strictEqual(resolveItemType('requirement'), ITEM_TYPES.REQUIREMENT);
});

test('AC2 – "REQUIREMENT" (all upper) resolves to ITEM_TYPES.REQUIREMENT', () => {
  // Note: ALIASES map uses lower key; test that the normalisation chain works
  // The handler lower-cases before lookup, so 'REQUIREMENT'.toLowerCase() = 'requirement'
  assert.strictEqual(resolveItemType('REQUIREMENT'), ITEM_TYPES.REQUIREMENT);
});

test('AC2 – "testcase" (no camel-case) resolves to ITEM_TYPES.TEST_CASE', () => {
  assert.strictEqual(resolveItemType('testcase'), ITEM_TYPES.TEST_CASE);
});

test('AC2 – "test_case" (snake_case) resolves to ITEM_TYPES.TEST_CASE', () => {
  assert.strictEqual(resolveItemType('test_case'), ITEM_TYPES.TEST_CASE);
});

test('AC2 – "test case" (spaced) resolves to ITEM_TYPES.TEST_CASE', () => {
  assert.strictEqual(resolveItemType('test case'), ITEM_TYPES.TEST_CASE);
});

test('AC2 – "DEFECT" (all upper) resolves to ITEM_TYPES.DEFECT', () => {
  assert.strictEqual(resolveItemType('DEFECT'), ITEM_TYPES.DEFECT);
});

// ---------------------------------------------------------------------------
// AC3 – Common API shorthand aliases are accepted
// ---------------------------------------------------------------------------

test('AC3 – "rq" alias resolves to ITEM_TYPES.REQUIREMENT', () => {
  assert.strictEqual(resolveItemType('rq'), ITEM_TYPES.REQUIREMENT);
});

test('AC3 – "tc" alias resolves to ITEM_TYPES.TEST_CASE', () => {
  assert.strictEqual(resolveItemType('tc'), ITEM_TYPES.TEST_CASE);
});

test('AC3 – "bug" alias resolves to ITEM_TYPES.DEFECT', () => {
  assert.strictEqual(resolveItemType('bug'), ITEM_TYPES.DEFECT);
});

test('AC3 – "df" alias resolves to ITEM_TYPES.DEFECT', () => {
  assert.strictEqual(resolveItemType('df'), ITEM_TYPES.DEFECT);
});

// ---------------------------------------------------------------------------
// AC4 – Leading/trailing whitespace is handled gracefully
// ---------------------------------------------------------------------------

test('AC4 – " Requirement " (with spaces) resolves correctly', () => {
  assert.strictEqual(resolveItemType('  Requirement  '), ITEM_TYPES.REQUIREMENT);
});

test('AC4 – "  testcase  " (with spaces) resolves correctly', () => {
  assert.strictEqual(resolveItemType('  testcase  '), ITEM_TYPES.TEST_CASE);
});

// ---------------------------------------------------------------------------
// AC5 – Unknown types throw a descriptive TypeError
// ---------------------------------------------------------------------------

test('AC5 – completely unknown type throws TypeError', () => {
  assert.throws(() => resolveItemType('FooBar'), {
    name: 'TypeError',
    message: /Unknown item type/,
  });
});

test('AC5 – empty string throws TypeError', () => {
  assert.throws(() => resolveItemType(''), {
    name: 'TypeError',
  });
});

test('AC5 – null throws TypeError', () => {
  assert.throws(() => resolveItemType(null), {
    name: 'TypeError',
  });
});

test('AC5 – undefined throws TypeError', () => {
  assert.throws(() => resolveItemType(undefined), {
    name: 'TypeError',
  });
});

test('AC5 – numeric input throws TypeError', () => {
  assert.throws(() => resolveItemType(42), {
    name: 'TypeError',
  });
});

// ---------------------------------------------------------------------------
// AC6 – isValidItemType() returns boolean without throwing
// ---------------------------------------------------------------------------

test('AC6 – isValidItemType("Requirement") returns true', () => {
  assert.strictEqual(isValidItemType('Requirement'), true);
});

test('AC6 – isValidItemType("testcase") returns true', () => {
  assert.strictEqual(isValidItemType('testcase'), true);
});

test('AC6 – isValidItemType("Unknown") returns false', () => {
  assert.strictEqual(isValidItemType('Unknown'), false);
});

test('AC6 – isValidItemType(null) returns false without throwing', () => {
  assert.strictEqual(isValidItemType(null), false);
});

// ---------------------------------------------------------------------------
// AC7 – ITEM_TYPES constants are frozen (immutable)
// ---------------------------------------------------------------------------

test('AC7 – ITEM_TYPES object is frozen', () => {
  assert.ok(Object.isFrozen(ITEM_TYPES), 'ITEM_TYPES should be a frozen object');
});

test('AC7 – Attempting to mutate ITEM_TYPES in strict mode throws', () => {
  assert.throws(() => {
    'use strict';
    // eslint-disable-next-line no-unused-expressions
    ITEM_TYPES.REQUIREMENT = 'Hacked';
  }, TypeError);
});
