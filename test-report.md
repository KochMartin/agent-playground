# Queue Implementation – Test Report
**Requirement:** RQ071026 – [soak] B8 two TestCases linked  
**Date:** 2026-06-07  
**Runner:** Node.js v22.22.3 built-in test runner (`node:test`)

## Summary

| Suite | Tests | Pass | Fail |
|---|---|---|---|
| Queue – happy-path operations | 6 | 6 | 0 |
| Queue – error and edge cases | 6 | 6 | 0 |
| **Total** | **12** | **12** | **0** |

## Happy-path Operations (6/6 passed)

| # | Test | Result |
|---|---|---|
| 1 | `size()` returns 0 for a new queue | ✅ PASS |
| 2 | `enqueue()` increases size | ✅ PASS |
| 3 | `dequeue()` returns items in FIFO order | ✅ PASS |
| 4 | `dequeue()` decreases size | ✅ PASS |
| 5 | `peek()` returns the front item without removing it | ✅ PASS |
| 6 | `size()` reflects all enqueue/dequeue operations | ✅ PASS |

## Error and Edge Cases (6/6 passed)

| # | Test | Result |
|---|---|---|
| 1 | `dequeue()` on an empty queue throws an Error | ✅ PASS |
| 2 | `peek()` on an empty queue throws an Error | ✅ PASS |
| 3 | `size()` is correct after mixed enqueue/dequeue operations | ✅ PASS |
| 4 | `dequeue()` after emptying queue throws again | ✅ PASS |
| 5 | `peek()` after emptying queue throws again | ✅ PASS |
| 6 | `enqueue()` accepts various value types | ✅ PASS |

## Conclusion

All 12 tests pass. The `Queue` class correctly implements FIFO ordering, `enqueue`/`dequeue`/`peek`/`size` semantics, and throws `Error` with message `"Queue is empty"` for `dequeue()` and `peek()` on an empty queue.
