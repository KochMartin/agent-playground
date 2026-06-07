# Test Report — `double()` (RQ071042)

**Date:** 2026-06-07  
**Runner:** Node.js v22 built-in test runner (`node:test`)  
**File:** `src/double.test.js`

## Summary

| Result | Count |
|--------|-------|
| ✅ Pass | 10 |
| ❌ Fail | 0 |
| ⏭ Skip | 0 |
| **Total** | **10** |

## Test Cases

| # | Name | Result |
|---|------|--------|
| 1 | doubles a positive integer | ✅ pass |
| 2 | doubles a negative integer | ✅ pass |
| 3 | doubles zero | ✅ pass |
| 4 | doubles a floating-point number | ✅ pass |
| 5 | doubles Infinity | ✅ pass |
| 6 | throws TypeError for a string | ✅ pass |
| 7 | throws TypeError for null | ✅ pass |
| 8 | throws TypeError for undefined | ✅ pass |
| 9 | throws TypeError for an object | ✅ pass |
| 10 | throws TypeError for NaN | ✅ pass |

## Implementation Notes

- `double(n)` returns `n * 2` for valid numeric input.
- Throws `TypeError` when the argument is not a number or is `NaN`.
- Edge cases covered: zero, negative numbers, floats, `Infinity`, `NaN`.
