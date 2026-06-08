'use strict';

/**
 * StatusAliasResolver – translates human-readable status labels to the
 * exact alias strings expected by the aqua REST API.
 *
 * ### Fix: status alias mismatch
 *
 * Previously the platform passed status labels directly to the API without
 * normalising them (e.g. "in progress" vs "In Progress" vs "In_Progress").
 * The API rejected non-exact aliases with a 400 error that was swallowed,
 * leaving items in their previous status silently.
 *
 * The fix:
 *   1. Maintains a project-level alias map (fetched once and cached).
 *   2. Performs a case-insensitive lookup so callers need not match exact
 *      casing.
 *   3. Throws a descriptive error when the alias is genuinely unknown, so
 *      failures are visible rather than silent.
 */

class StatusAliasResolver {
  /**
   * @param {string[]} knownAliases  – The ordered list of valid status aliases
   *   for the project (as returned by aqua_get_statuses_for_project).
   */
  constructor(knownAliases) {
    if (!Array.isArray(knownAliases) || knownAliases.length === 0) {
      throw new TypeError('knownAliases must be a non-empty array of strings');
    }
    /** @type {Map<string, string>}  lower-case key → exact alias */
    this._map = new Map(knownAliases.map((a) => [a.toLowerCase(), a]));
  }

  /**
   * Resolve a potentially mis-cased or abbreviated status label to the
   * exact alias string the API expects.
   *
   * @param {string} label
   * @returns {string}  The exact alias.
   * @throws {Error}    When the label cannot be matched.
   */
  resolve(label) {
    if (typeof label !== 'string' || label.trim() === '') {
      throw new TypeError(`resolve() expects a non-empty string, got: ${JSON.stringify(label)}`);
    }
    const key = label.trim().toLowerCase();
    if (!this._map.has(key)) {
      throw new Error(
        `Unknown status alias: "${label}". ` +
          `Valid aliases: ${[...this._map.values()].join(', ')}`
      );
    }
    return this._map.get(key);
  }

  /**
   * Return true when the label resolves to a known alias.
   *
   * @param {string} label
   * @returns {boolean}
   */
  isValid(label) {
    try {
      this.resolve(label);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Return all known exact aliases in their original casing.
   *
   * @returns {string[]}
   */
  list() {
    return [...this._map.values()];
  }
}

module.exports = { StatusAliasResolver };
