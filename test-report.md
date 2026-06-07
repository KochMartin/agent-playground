# Test Report — `parseCsvLine`

**Requirement:** RQ071024 – [soak] B7 two attachments (md + json)  
**Date:** 2026-06-07  
**Function under test:** `parseCsvLine(line)` (`parseCsvLine.js`)

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 15 |
| ✅ Passed   | 15 |
| ❌ Failed   | 0  |
| Result      | **PASS** |

## Test Cases

| # | Description | Status |
|---|-------------|--------|
| 1 | empty string returns one empty field | ✅ Pass |
| 2 | single field, no comma | ✅ Pass |
| 3 | two simple fields | ✅ Pass |
| 4 | three simple fields | ✅ Pass |
| 5 | quoted field without comma | ✅ Pass |
| 6 | quoted field containing comma | ✅ Pass |
| 7 | quoted field among others | ✅ Pass |
| 8 | escaped double-quote inside quoted field | ✅ Pass |
| 9 | escaped quote mid-field | ✅ Pass |
| 10 | leading comma → leading empty field | ✅ Pass |
| 11 | trailing comma → trailing empty field | ✅ Pass |
| 12 | two commas → three fields, middle empty | ✅ Pass |
| 13 | mix of quoted and unquoted | ✅ Pass |
| 14 | numbers and spaces | ✅ Pass |
| 15 | fully quoted fields | ✅ Pass |

## Implementation Notes

`parseCsvLine` is a zero-dependency, pure JavaScript function that:

- Iterates character-by-character through the input string.
- Enters **quoted mode** when the current character is `"`, collecting characters until the matching closing `"`.
- Handles **escaped double-quotes** (`""`) inside quoted fields by replacing them with a single `"`.
- Falls back to **unquoted mode** for normal comma-delimited tokens.
- Correctly returns `['']` for an empty input string.
