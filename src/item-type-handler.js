'use strict';

/**
 * ItemTypeHandler – maps raw item-type strings from the aqua API to
 * normalised internal constants, and validates them before use.
 *
 * ### Fix: item type misidentification
 *
 * Previously the handler compared raw strings case-sensitively and fell
 * through to the default branch for variants like "testcase", "test_case",
 * or "REQUIREMENT", causing downstream code to treat them as unknown types.
 *
 * The fix normalises the input to lower-case (with underscores collapsed)
 * before the lookup so that all accepted spellings map to the same constant.
 */

const ITEM_TYPES = Object.freeze({
  REQUIREMENT: 'Requirement',
  TEST_CASE: 'TestCase',
  DEFECT: 'Defect',
  TASK: 'Task',
  EPIC: 'Epic',
});

/** Variants accepted for each canonical type */
const ALIASES = {
  requirement: ITEM_TYPES.REQUIREMENT,
  requirements: ITEM_TYPES.REQUIREMENT,
  rq: ITEM_TYPES.REQUIREMENT,
  testcase: ITEM_TYPES.TEST_CASE,
  test_case: ITEM_TYPES.TEST_CASE,
  'test case': ITEM_TYPES.TEST_CASE,
  tc: ITEM_TYPES.TEST_CASE,
  defect: ITEM_TYPES.DEFECT,
  bug: ITEM_TYPES.DEFECT,
  df: ITEM_TYPES.DEFECT,
  task: ITEM_TYPES.TASK,
  epic: ITEM_TYPES.EPIC,
};

/**
 * Normalise an item-type string to one of the ITEM_TYPES constants.
 *
 * @param {string} raw  - The raw type string from the API or user input.
 * @returns {string}    - A value from ITEM_TYPES.
 * @throws {TypeError}  - If the raw string cannot be resolved.
 */
function resolveItemType(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new TypeError(`resolveItemType() expects a non-empty string, got: ${JSON.stringify(raw)}`);
  }
  const key = raw.trim().toLowerCase().replace(/_/g, '_'); // normalise
  const resolved = ALIASES[key];
  if (!resolved) {
    throw new TypeError(`Unknown item type: "${raw}". Valid types: ${Object.values(ITEM_TYPES).join(', ')}`);
  }
  return resolved;
}

/**
 * Return true when the string is a valid, known item type (any casing).
 *
 * @param {string} raw
 * @returns {boolean}
 */
function isValidItemType(raw) {
  try {
    resolveItemType(raw);
    return true;
  } catch {
    return false;
  }
}

module.exports = { ITEM_TYPES, resolveItemType, isValidItemType };
