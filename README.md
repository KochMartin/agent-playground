# qa-F1-2026-06-08 per-type TC proof

**Aqua Work Item:** #71087

## Purpose

This module provides a deterministic proof that TestCase-**exclusive** statuses
(`QA passed`, `QA failed`, `Need Rework`) can only exist on `TestCase` items and
are never reachable from `Requirement` or `Defect` items.

It also validates the full TestCase status-workflow state machine, including the
canonical trigger path **TC design → Ready to test** fired by the
`qa-f1-testcase` trigger.

## Modules

| Module | Responsibility |
|---|---|
| `qa/per_type_status_proof/status_definitions.py` | Canonical status enums split by item type; `exclusive()` / `terminal()` helpers |
| `qa/per_type_status_proof/workflow.py` | Directed TC state-machine + `assert_*` guards |
| `qa/per_type_status_proof/prover.py` | `qa_status_prover()` – main callable invoked by the trigger |

## TestCase state machine

```
TC design ──► Ready to test ──► QA passed  (terminal)
                          └──► QA failed ──► Need Rework ──► TC design
                                                         └──► Ready to test
```

Terminal (TestCase-exclusive) statuses: **QA passed**, **QA failed**, **Need Rework**

## Running tests

```bash
pip install pytest
pytest
```
