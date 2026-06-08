'use strict';

/**
 * E2E tests – status alias fix
 *
 * Verifies that StatusAliasResolver correctly maps human-readable status
 * labels (in any casing) to the exact alias strings the aqua API expects,
 * and throws clear errors for unknown aliases instead of silently failing.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { StatusAliasResolver } = require('../src/status-alias-resolver');

// ---------------------------------------------------------------------------
// Shared fixture – a resolver initialised with typical aqua project statuses
// ---------------------------------------------------------------------------

const PROJECT_STATUSES = [
  'New',
  'In progress',
  'Human Review',
  'Done',
  'Closed',
  'Rejected',
];

function makeResolver() {
  return new StatusAliasResolver(PROJECT_STATUSES);
}

// ---------------------------------------------------------------------------
// AC1 – Exact-match (correct casing) resolves to the same string
// ---------------------------------------------------------------------------

test('AC1 – "New" resolves to "New"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('New'), 'New');
});

test('AC1 – "In progress" resolves to "In progress"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('In progress'), 'In progress');
});

test('AC1 – "Human Review" resolves to "Human Review"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('Human Review'), 'Human Review');
});

test('AC1 – "Done" resolves to "Done"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('Done'), 'Done');
});

// ---------------------------------------------------------------------------
// AC2 – Case-insensitive variants resolve to the exact API alias (the fix)
// ---------------------------------------------------------------------------

test('AC2 – "new" (lower) resolves to "New"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('new'), 'New');
});

test('AC2 – "NEW" (upper) resolves to "New"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('NEW'), 'New');
});

test('AC2 – "in progress" (lower) resolves to "In progress"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('in progress'), 'In progress');
});

test('AC2 – "IN PROGRESS" (upper) resolves to "In progress"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('IN PROGRESS'), 'In progress');
});

test('AC2 – "human review" (lower) resolves to "Human Review"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('human review'), 'Human Review');
});

test('AC2 – "HUMAN REVIEW" (upper) resolves to "Human Review"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('HUMAN REVIEW'), 'Human Review');
});

test('AC2 – "DONE" (upper) resolves to "Done"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('DONE'), 'Done');
});

test('AC2 – "closed" (lower) resolves to "Closed"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('closed'), 'Closed');
});

test('AC2 – "rejected" (lower) resolves to "Rejected"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('rejected'), 'Rejected');
});

// ---------------------------------------------------------------------------
// AC3 – Leading/trailing whitespace is trimmed
// ---------------------------------------------------------------------------

test('AC3 – "  New  " (whitespace) resolves to "New"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('  New  '), 'New');
});

test('AC3 – "  in progress  " (whitespace + lower) resolves to "In progress"', () => {
  const r = makeResolver();
  assert.strictEqual(r.resolve('  in progress  '), 'In progress');
});

// ---------------------------------------------------------------------------
// AC4 – Unknown alias throws a descriptive Error (not silent failure)
// ---------------------------------------------------------------------------

test('AC4 – unknown alias "Pending" throws Error', () => {
  const r = makeResolver();
  assert.throws(() => r.resolve('Pending'), {
    message: /Unknown status alias/,
  });
});

test('AC4 – unknown alias "in_progress" (underscore) throws Error', () => {
  // Underscores are not normalised for status aliases (different from item types)
  const r = makeResolver();
  assert.throws(() => r.resolve('in_progress'), {
    message: /Unknown status alias/,
  });
});

test('AC4 – empty string throws TypeError', () => {
  const r = makeResolver();
  assert.throws(() => r.resolve(''), TypeError);
});

test('AC4 – null throws TypeError', () => {
  const r = makeResolver();
  assert.throws(() => r.resolve(null), TypeError);
});

// ---------------------------------------------------------------------------
// AC5 – isValid() returns boolean without throwing
// ---------------------------------------------------------------------------

test('AC5 – isValid("New") returns true', () => {
  const r = makeResolver();
  assert.strictEqual(r.isValid('New'), true);
});

test('AC5 – isValid("in progress") returns true', () => {
  const r = makeResolver();
  assert.strictEqual(r.isValid('in progress'), true);
});

test('AC5 – isValid("Pending") returns false', () => {
  const r = makeResolver();
  assert.strictEqual(r.isValid('Pending'), false);
});

test('AC5 – isValid(null) returns false without throwing', () => {
  const r = makeResolver();
  assert.strictEqual(r.isValid(null), false);
});

// ---------------------------------------------------------------------------
// AC6 – list() returns all registered aliases in their original casing
// ---------------------------------------------------------------------------

test('AC6 – list() returns all project status aliases', () => {
  const r = makeResolver();
  const aliases = r.list();

  assert.ok(Array.isArray(aliases), 'list() should return an array');
  assert.strictEqual(aliases.length, PROJECT_STATUSES.length);
  for (const expected of PROJECT_STATUSES) {
    assert.ok(aliases.includes(expected), `list() should contain "${expected}"`);
  }
});

// ---------------------------------------------------------------------------
// AC7 – Constructor validates its argument
// ---------------------------------------------------------------------------

test('AC7 – constructing with an empty array throws TypeError', () => {
  assert.throws(() => new StatusAliasResolver([]), TypeError);
});

test('AC7 – constructing with a non-array throws TypeError', () => {
  assert.throws(() => new StatusAliasResolver('New'), TypeError);
});

test('AC7 – constructing with null throws TypeError', () => {
  assert.throws(() => new StatusAliasResolver(null), TypeError);
});

// ---------------------------------------------------------------------------
// AC8 – Resolver works with a single-status project
// ---------------------------------------------------------------------------

test('AC8 – single-status resolver works correctly', () => {
  const r = new StatusAliasResolver(['Open']);
  assert.strictEqual(r.resolve('open'), 'Open');
  assert.throws(() => r.resolve('Closed'), /Unknown status alias/);
});
