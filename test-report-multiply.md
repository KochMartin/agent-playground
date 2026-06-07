# Test Report — `multiply(a, b)` Utility

**Requirement:** RQ071012 — [soak] A1 multiply utility  
**Date:** 2026-06-07  
**Runner:** Node.js built-in test runner (`node --test`)  
**File under test:** `src/multiply.js`  
**Test file:** `src/multiply.test.js`

---

## Summary

| Metric      | Value |
|-------------|-------|
| Total tests | 8     |
| Passed      | 8     |
| Failed      | 0     |
| Skipped     | 0     |

---

## Test Cases

| # | Test Name | Result | Notes |
|---|-----------|--------|-------|
| 1 | positive * positive | ✅ PASS | `3×4=12`, `7×8=56` |
| 2 | negative * positive | ✅ PASS | `-5×3=-15`, `-1×100=-100` |
| 3 | multiplication by zero | ✅ PASS | `0×99=0`, `-7×0=-0` (IEEE 754 `-0 == 0`), `0×0=0` |
| 4 | floating-point values | ✅ PASS | `0.1×0.2≈0.02`, `1.5×4=6`, `2.5×2.5=6.25` |
| 5 | throws TypeError — first arg is string | ✅ PASS | `multiply('a', 2)` → `TypeError` |
| 6 | throws TypeError — second arg is string | ✅ PASS | `multiply(2, 'b')` → `TypeError` |
| 7 | throws TypeError — both args non-numeric | ✅ PASS | `multiply(null, undefined)` → `TypeError` |
| 8 | throws TypeError — first arg is object | ✅ PASS | `multiply({}, 3)` → `TypeError` |

---

## Implementation Notes

- `multiply(a, b)` validates both arguments with `typeof` checks before computing.
- Any non-`number` input throws a `TypeError` with a descriptive message.
- IEEE 754 negative-zero (`-0`) is a natural result of `negative × 0`; tests handle this with loose equality (`== 0`).
- Floating-point precision is verified with an epsilon comparison (`< 1e-10`).

---

## Conclusion

All 8 unit tests pass. The `multiply` utility satisfies the requirements:
- Returns the product of two numbers.
- Throws `TypeError` for non-numeric inputs.
