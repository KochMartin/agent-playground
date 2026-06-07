# Test Report — `lastChar` (RQ071041)

**Date:** 2026-06-07  
**Runtime:** Node.js v22.22.3  
**Test runner:** `node --test` (built-in)  
**File under test:** `src/lastChar.js`  
**Test file:** `src/lastChar.test.js`

---

## Summary

| Total | Pass | Fail | Skipped |
|-------|------|------|---------|
| 7     | 7    | 0    | 0       |

**Result: ✅ ALL TESTS PASSED**

---

## Test Cases

| # | Test name | Result |
|---|-----------|--------|
| 1 | returns the last character of a normal string | ✅ pass |
| 2 | returns the last character of a single-character string | ✅ pass |
| 3 | returns an empty string when given an empty string | ✅ pass |
| 4 | works with strings containing spaces | ✅ pass |
| 5 | works with a string that ends in a space | ✅ pass |
| 6 | works with a numeric string | ✅ pass |
| 7 | works with special characters | ✅ pass |

---

## Implementation Notes

`lastChar(s)` is implemented in `src/lastChar.js`:

```js
function lastChar(s) {
  if (s.length === 0) return '';
  return s[s.length - 1];
}
```

Edge cases covered:
- Empty string → returns `''`
- Single character → returns that character
- Trailing space → returns `' '`
- Special characters (`!@#$`) → returns `'$'`
