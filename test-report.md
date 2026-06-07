# Test Report — isEven (RQ071038)

**Date:** 2026-06-07  
**Function:** `isEven(n)` — returns `true` if integer `n` is even, `false` otherwise.  
**Source:** `src/isEven.js`  
**Test file:** `src/isEven.test.js`

## Results

| # | Input | Expected | Actual | Status |
|---|-------|----------|--------|--------|
| 1 | `0`   | `true`   | `true` | ✅ PASS |
| 2 | `2`   | `true`   | `true` | ✅ PASS |
| 3 | `3`   | `false`  | `false`| ✅ PASS |
| 4 | `-4`  | `true`   | `true` | ✅ PASS |

**Summary:** 4/4 tests passed — all green.

## Implementation Notes

- Uses modulo operator: `n % 2 === 0`
- Handles zero correctly (even by definition)
- Handles negative integers correctly (`-4 % 2 === 0` in JS)
