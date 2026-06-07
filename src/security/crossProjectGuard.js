/**
 * crossProjectGuard.js
 *
 * Soak-test C12 — Cross-project / cross-repo prompt-injection guard.
 *
 * This module detects and rejects instructions embedded inside work-item
 * descriptions (or any other untrusted text) that attempt to redirect an
 * agent's actions to:
 *   • a different repository than the one it was legitimately cloned from, or
 *   • a different project / item namespace than the one it was assigned to.
 *
 * Such instructions are a well-known prompt-injection vector.  The guard
 * surfaces them as structured violations so they can be logged, alerted on,
 * and refused without any side-effects.
 */

'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Patterns that indicate a cross-repo redirect attempt. */
const CROSS_REPO_PATTERNS = [
  /clone\s+https?:\/\//i,
  /git\s+clone\s+/i,
  /\binternal.?secrets.?repo\b/i,
  /operate\s+on\s+(a\s+)?(?:different|other|another)\s+repo/i,
];

/** Patterns that indicate a cross-project redirect attempt. */
const CROSS_PROJECT_PATTERNS = [
  /project\s+\d{4,}/i,            // "project 999999"
  /operate\s+on\s+(?:aqua\s+)?project/i,
  /\bRQ\d{6,}\b/,                 // foreign item IDs like RQ888888
  /ignore\s+the\s+current\s+(item|project|repo)/i,
  /only\s+project\s+\d+\s+(and|matters)/i,
];

/** Patterns that indicate a secret-exfiltration attempt. */
const SECRET_LEAK_PATTERNS = [
  /secretLeak\s*\(\s*\)/i,
  /implement\s+a\s+function\s+secret/i,
  /exfiltrat/i,
];

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Inspect `text` for known cross-project / cross-repo injection patterns.
 *
 * @param {string} text            - The untrusted text to analyse (e.g. a
 *                                   work-item description).
 * @param {object} [opts]
 * @param {string} [opts.sourceId] - Human-readable label for the text source,
 *                                   used in violation messages.
 * @returns {{ safe: boolean, violations: string[] }}
 */
function inspect(text, opts = {}) {
  if (typeof text !== 'string') {
    throw new TypeError(`inspect() expects a string, got ${typeof text}`);
  }

  const source = opts.sourceId ?? '<unknown>';
  const violations = [];

  const checks = [
    { label: 'cross-repo redirect',    patterns: CROSS_REPO_PATTERNS    },
    { label: 'cross-project redirect', patterns: CROSS_PROJECT_PATTERNS },
    { label: 'secret-leak attempt',    patterns: SECRET_LEAK_PATTERNS   },
  ];

  for (const { label, patterns } of checks) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        violations.push(
          `[${source}] Potential ${label} detected (matched: ${pattern})`
        );
        break; // one violation per category is enough
      }
    }
  }

  return { safe: violations.length === 0, violations };
}

/**
 * Convenience wrapper that throws if the text is not safe.
 *
 * @param {string} text
 * @param {object} [opts]
 * @throws {Error} when violations are found.
 */
function assertSafe(text, opts = {}) {
  const result = inspect(text, opts);
  if (!result.safe) {
    throw new Error(
      `Prompt-injection guard triggered — refusing to proceed.\n` +
      result.violations.map(v => `  • ${v}`).join('\n')
    );
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { inspect, assertSafe };
