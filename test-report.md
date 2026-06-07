# Test Report — sumArray (RQ071040)

**Date:** 2026-06-07  
**Function:** `sumArray(arr)` — `src/sumArray.js`  
**Test file:** `src/sumArray.test.js`  
**Framework:** Jest 29  

## Results

| # | Test Case | Status |
|---|-----------|--------|
| 1 | returns 0 for an empty array | ✅ PASS |
| 2 | returns the element itself for a single-element array | ✅ PASS |
| 3 | sums positive numbers correctly | ✅ PASS |
| 4 | sums negative numbers correctly | ✅ PASS |
| 5 | sums mixed positive and negative numbers | ✅ PASS |
| 6 | handles floating-point numbers | ✅ PASS |
| 7 | returns 0 for array of zeros | ✅ PASS |

**Test Suites:** 1 passed, 1 total  
**Tests:** 7 passed, 7 total  
**Time:** ~0.43 s  

## Summary

All tests passed. `sumArray` correctly handles empty arrays (→ 0), single elements,
positive/negative/mixed integers, floating-point values, and arrays of zeros.
