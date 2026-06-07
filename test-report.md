# Stack Class – Test Report

**Requirement:** RQ071018 – [soak] A4 Stack class  
**Date:** 2026-06-07  
**Runtime:** Node.js v22.22.3 (built-in test runner)  
**File under test:** `src/Stack.js`  
**Test file:** `src/Stack.test.js`

---

## Summary

| Result  | Count |
|---------|-------|
| ✅ Pass  | 8     |
| ❌ Fail  | 0     |
| ⏭ Skip  | 0     |
| **Total** | **8** |

All tests passed. Duration: ~102 ms.

---

## Test Results

### Suite: Stack > isEmpty()

| # | Test | Result |
|---|------|--------|
| 1 | returns true on a new stack | ✅ PASS |
| 2 | returns false after a push | ✅ PASS |
| 3 | returns true again after all items are popped | ✅ PASS |

### Suite: Stack > push() and pop() – LIFO order

| # | Test | Result |
|---|------|--------|
| 4 | single push then pop returns the same item | ✅ PASS |
| 5 | multiple pushes then pops return items in LIFO order | ✅ PASS |

### Suite: Stack > peek()

| # | Test | Result |
|---|------|--------|
| 6 | returns the top element without removing it | ✅ PASS |

### Suite: Stack > error cases on empty stack

| # | Test | Result |
|---|------|--------|
| 7 | pop() on an empty stack throws an Error | ✅ PASS |
| 8 | peek() on an empty stack throws an Error | ✅ PASS |

---

## Notes

- `pop()` and `peek()` correctly throw `Error('Stack is empty')` on an empty stack.
- LIFO ordering is verified by pushing three values (1, 2, 3) and confirming they are popped in reverse order (3, 2, 1).
- `peek()` does not mutate the stack; subsequent `pop()` calls still return both pushed items.
- `isEmpty()` transitions correctly: `true` → `false` (after push) → `true` (after pop of last item).
