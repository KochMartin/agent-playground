# Test Report — emojiLength() Unicode Robustness
**Requirement:** RQ071036 · [soak] C14 emoji unicode robustness 🚀  
**Date:** 2026-06-07  
**Status:** ✅ All tests passed

---

## Summary

| Metric | Value |
|--------|-------|
| Total test cases | 11 |
| Passed | 11 |
| Failed | 0 |
| Skipped | 0 |

---

## Test Cases

| # | Description | Input | Expected | Actual | Result |
|---|-------------|-------|----------|--------|--------|
| TC-1 | Empty string | `""` | `0` | `0` | ✅ PASS |
| TC-2 | ASCII word | `"hello"` | `5` | `5` | ✅ PASS |
| TC-3 | Three emoji | `"😀😀😀"` | `3` | `3` | ✅ PASS |
| TC-4 | CJK characters | `"漢字"` | `2` | `2` | ✅ PASS |
| TC-5 | Mixed (ASCII + emoji + CJK + Greek + Arabic + Hebrew) | `"Hi 🚀 漢字 αβγ مرحبا שלום 🎌"` | `24` | `24` | ✅ PASS |
| TC-6 | Flag emoji (2 regional indicator symbols) | `"🇩🇪"` | `2` | `2` | ✅ PASS |
| TC-7 | Demonstrate UTF-16 surrogate-pair issue | `"😀😀😀".length` | `6` | `6` | ✅ PASS |
| TC-8 | Confirm emojiLength beats `.length` | `emojiLength("😀😀😀")` | `3` | `3` | ✅ PASS |
| TC-9 | Digit string | `"12345"` | `5` | `5` | ✅ PASS |
| TC-10 | Single high-plane emoji | `"🚀"` | `1` | `1` | ✅ PASS |
| TC-11 | Accented Latin (BMP) | `"ÀÁÂÃÄÅÆÇÈÉ"` | `10` | `10` | ✅ PASS |

---

## Implementation Note

`emojiLength(s)` uses `Array.from(s).length`.  
`Array.from` iterates by **Unicode code point** (using the string's built-in iterator),
so supplementary-plane characters (emoji, etc.) stored as UTF-16 surrogate pairs each
count as **1** — unlike JavaScript's native `.length` which counts UTF-16 code units.

```js
function emojiLength(s) {
  return Array.from(s).length;
}
```

The spread alternative `[...s].length` is equivalent and equally valid.
