# Test Report – RQ071020: Add Input Validation

**Date:** 2026-06-07  
**Author:** Agent (AgentM)  
**Work Item:** RQ071020 – [soak] A5 add input validation

---

## 1. Repository Inspection

The repository (`KochMartin/agent-playground`) was cloned and inspected.  
At the time of implementation, the repository contained **only a `.gitignore` file** and no source code.  
There were no existing exported functions to which validation could be added.

> ⚠️ **Note:** Per the work item instructions ("If you genuinely cannot find a suitable existing function, add validation to a small new function instead and clearly note in your report that you did so"), two new utility functions were introduced in `src/mathUtils.js`.

---

## 2. Changes Made

### New file: `src/mathUtils.js`

Two exported utility functions were created:

#### `clamp(value, min, max) → number`
Clamps a numeric value between `min` and `max` (inclusive).

**Validation added:**
| Condition | Error thrown |
|-----------|-------------|
| Any argument is not a finite number (wrong type, NaN, Infinity, null, undefined) | `TypeError` |
| `min > max` | `RangeError` |

**Valid behaviour preserved:** `Math.min(Math.max(value, min), max)` is returned unchanged for all valid inputs.

---

#### `factorial(n) → number`
Returns `n!` for a non-negative integer `n`.

**Validation added:**
| Condition | Error thrown |
|-----------|-------------|
| `n` is not a number, not finite, or not an integer (e.g. string, float, NaN, null) | `TypeError` |
| `n < 0` | `RangeError` |

**Valid behaviour preserved:** Iterative multiplication loop is unchanged.

---

### New file: `src/mathUtils.test.js`

Uses the Node.js built-in test runner (`node:test` + `node:assert/strict`).

---

## 3. Test Results

Run command: `node --test src/mathUtils.test.js`

```
# tests 29
# suites 6
# pass  29
# fail  0
```

### Test breakdown

| Suite | Tests | Result |
|-------|-------|--------|
| clamp – valid inputs (behaviour unchanged) | 7 | ✅ all pass |
| clamp – TypeError for wrong-typed inputs | 7 | ✅ all pass |
| clamp – RangeError when min > max | 3 | ✅ all pass |
| factorial – valid inputs (behaviour unchanged) | 4 | ✅ all pass |
| factorial – TypeError for wrong-typed inputs | 5 | ✅ all pass |
| factorial – RangeError for negative inputs | 3 | ✅ all pass |
| **Total** | **29** | ✅ **29/29 pass** |

---

## 4. Files Changed

| File | Action |
|------|--------|
| `src/mathUtils.js` | **Created** – two new exported functions with input validation |
| `src/mathUtils.test.js` | **Created** – 29 unit tests covering valid, TypeError, and RangeError paths |
| `package.json` | **Created** – project manifest with test script |
