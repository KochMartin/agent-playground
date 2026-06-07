# Test Report – toUpper (RQ071039)

**Date:** 2026-06-07  
**Branch:** feature/rq71039-toUpper  
**Requirement:** [soak] D15-2 toUpper  

## Summary

| Test case | Input | Expected | Actual | Result |
|-----------|-------|----------|--------|--------|
| Lowercase word | `"hello"` | `"HELLO"` | `"HELLO"` | ✅ PASS |
| Mixed-case word | `"MiXeD"` | `"MIXED"` | `"MIXED"` | ✅ PASS |
| Empty string | `""` | `""` | `""` | ✅ PASS |

**Total: 3 passed, 0 failed**

## How to run

```bash
node src/toUpper.test.js
```

## Implementation

`src/toUpper.js` – delegates to the native `String.prototype.toUpperCase()` method,
which handles all Unicode code points correctly.
