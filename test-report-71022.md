# Test Report – RQ071022: clamp() Utility
**Date:** 2026-06-07  
**Branch:** feature/71022-clamp-utility  
**Runner:** Node.js built-in test runner (`node --test`)

## Summary

| Total | Pass | Fail | Skipped |
|-------|------|------|---------|
| 10    | 10   | 0    | 0       |

All tests passed ✅

## Test Results

| # | Test Name | Result |
|---|-----------|--------|
| 1 | value below min is clamped to min | ✅ PASS |
| 2 | value above max is clamped to max | ✅ PASS |
| 3 | value within range is returned unchanged | ✅ PASS |
| 4 | value equal to min is returned unchanged | ✅ PASS |
| 5 | value equal to max is returned unchanged | ✅ PASS |
| 6 | min > max throws RangeError | ✅ PASS |
| 7 | non-numeric value throws TypeError | ✅ PASS |
| 8 | negative range: value is clamped correctly | ✅ PASS |
| 9 | zero boundary: clamp with min=0 and max=0 returns 0 for any value | ✅ PASS |
| 10 | non-numeric min throws TypeError | ✅ PASS |

## Coverage

| Scenario | Covered |
|----------|---------|
| Value below min | ✅ |
| Value above max | ✅ |
| Value within range | ✅ |
| Value equals min | ✅ |
| Value equals max | ✅ |
| min > max (RangeError) | ✅ |
| Non-numeric value (TypeError) | ✅ |
| Negative range | ✅ |
| Zero boundary (min=max=0) | ✅ |
| Non-numeric min (TypeError) | ✅ |

## Implementation

**File:** `src/clamp.js`

```
clamp(value, min, max)
  - Returns value if min ≤ value ≤ max
  - Returns min if value < min
  - Returns max if value > max
  - Throws TypeError  if any argument is not a finite number
  - Throws RangeError if min > max
```
