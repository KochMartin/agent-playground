# Test Report — isPalindrome (RQ071014)

**Date:** 2026-06-07  
**Function:** `isPalindrome(s: string): boolean`  
**File:** `isPalindrome.js`  
**Test file:** `isPalindrome.test.js`  
**Runtime:** Node.js (no external dependencies)

---

## Summary

| Result | Count |
|--------|-------|
| ✅ Passed | 13 |
| ❌ Failed | 0 |
| **Total** | **13** |

---

## Test Cases

| # | Description | Input | Expected | Result |
|---|-------------|-------|----------|--------|
| 1 | Empty string | `""` | `true` | ✅ PASS |
| 2 | Single character (lowercase) | `"a"` | `true` | ✅ PASS |
| 3 | Single character (uppercase) | `"Z"` | `true` | ✅ PASS |
| 4 | Mixed-case palindrome | `"Racecar"` | `true` | ✅ PASS |
| 5 | All-lowercase palindrome | `"racecar"` | `true` | ✅ PASS |
| 6 | All-uppercase palindrome | `"LEVEL"` | `true` | ✅ PASS |
| 7 | Mixed-case palindrome | `"MadaM"` | `true` | ✅ PASS |
| 8 | Clear non-palindrome | `"hello"` | `false` | ✅ PASS |
| 9 | Non-palindrome | `"world"` | `false` | ✅ PASS |
| 10 | Unicode palindrome | `"上海自来水来自海上"` | `true` | ✅ PASS |
| 11 | Unicode non-palindrome | `"こんにちは"` | `false` | ✅ PASS |
| 12 | Numeric string palindrome | `"12321"` | `true` | ✅ PASS |
| 13 | Numeric string non-palindrome | `"12345"` | `false` | ✅ PASS |
| 14 | TypeError for non-string input | `123` | throws TypeError | ✅ PASS |

---

## Implementation Notes

- Case-insensitivity is achieved by converting the input to lower-case before comparison.
- Unicode support relies on the spread operator (`[...str]`) which correctly iterates over Unicode code points (including multi-byte characters), instead of `split('')` which would split surrogate pairs.
- An explicit `TypeError` is thrown for non-string inputs to prevent silent misbehaviour.

---

## Raw Test Output

```
=== isPalindrome Unit Tests ===

  ✅ PASS: empty string returns true
  ✅ PASS: single character returns true
  ✅ PASS: mixed-case palindrome "Racecar" returns true
  ✅ PASS: all-lowercase palindrome "racecar" returns true
  ✅ PASS: all-uppercase palindrome "LEVEL" returns true
  ✅ PASS: mixed-case "MadaM" returns true
  ✅ PASS: clear non-palindrome "hello" returns false
  ✅ PASS: non-palindrome "world" returns false
  ✅ PASS: unicode palindrome "上海自来水来自海上" returns true
  ✅ PASS: unicode non-palindrome "こんにちは" returns false
  ✅ PASS: numeric palindrome "12321" returns true
  ✅ PASS: numeric non-palindrome "12345" returns false
  ✅ PASS: throws TypeError for non-string input

=== Results: 13 passed, 0 failed ===
```
