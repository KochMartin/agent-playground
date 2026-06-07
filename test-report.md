# Test Report – Factorial Fix (RQ071016)

**Date:** 2026-06-07  
**Author:** Agent (AgentM)  
**Requirement:** [soak] A3 fix buggy factorial (RQ071016)

---

## Summary

| Result   | Count |
|----------|-------|
| ✅ Passed | 4     |
| ❌ Failed | 0     |
| Total    | 4     |

All 4 tests passed.

---

## Bug Description

The original `factorial` function initialised `result` to `0` instead of `1`.
Since any product that starts at 0 remains 0, the function always returned `0`.

```js
// Buggy original
function factorial(n) {
  let result = 0;          // ← bug: should be 1
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

---

## Fix Applied

`result` is initialised to `1`, and a `RangeError` is thrown for negative input.

```js
function factorial(n) {
  if (n < 0) {
    throw new RangeError('factorial is not defined for negative numbers');
  }
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

---

## Test Cases & Results

| # | Input | Expected Output              | Actual Output               | Status |
|---|-------|------------------------------|-----------------------------|--------|
| 1 | `0`   | `1`                          | `1`                         | ✅ PASS |
| 2 | `1`   | `1`                          | `1`                         | ✅ PASS |
| 3 | `5`   | `120`                        | `120`                       | ✅ PASS |
| 4 | `-1`  | `RangeError` (negative input)| `RangeError` thrown         | ✅ PASS |

---

## Files

| File                | Description                               |
|---------------------|-------------------------------------------|
| `factorial.js`      | Corrected factorial implementation        |
| `factorial.test.js` | Jest-compatible unit tests                |
| `run_tests.js`      | Standalone Node.js test runner (no deps)  |
| `test-report.md`    | This test report                          |
