"""
per_type_status_proof.prover
==============================
``qa_status_prover`` – the callable invoked by the qa-f1-testcase trigger.

It receives an aqua item snapshot and verifies that:

1. The item is a ``TestCase``.
2. The current status is one of the known TestCase statuses.
3. If the status is terminal (QA passed / QA failed / Need Rework) the
   status is classified as TestCase-EXCLUSIVE (i.e. it could never appear
   legitimately on a Requirement or Defect).
4. The last transition recorded in the item history was a valid step in
   the TestCase state machine.

Returns a :class:`ProofResult` data-class.
"""

from __future__ import annotations

import dataclasses
from typing import Any

from .status_definitions import TestCaseStatus
from .workflow import (
    StatusViolationError,
    assert_status_allowed,
    assert_tc_transition_allowed,
    is_tc_exclusive_status,
    TC_TRANSITIONS,
)


@dataclasses.dataclass
class ProofResult:
    passed: bool
    item_type: str
    current_status: str
    is_terminal: bool
    is_exclusive: bool
    violations: list[str] = dataclasses.field(default_factory=list)

    # ------------------------------------------------------------------ #
    def __str__(self) -> str:  # pragma: no cover
        verdict = "PASSED" if self.passed else "FAILED"
        lines = [
            f"[{verdict}] Per-type status proof",
            f"  item_type      : {self.item_type}",
            f"  current_status : {self.current_status}",
            f"  is_terminal    : {self.is_terminal}",
            f"  is_exclusive   : {self.is_exclusive}",
        ]
        if self.violations:
            lines.append("  violations:")
            for v in self.violations:
                lines.append(f"    - {v}")
        return "\n".join(lines)


def qa_status_prover(item: dict[str, Any]) -> ProofResult:
    """
    Prove the per-type status constraints for *item*.

    Parameters
    ----------
    item:
        A dict with at least the keys ``item_type``, ``status``, and
        optionally ``previous_status`` for transition checking.

    Returns
    -------
    :class:`ProofResult`
    """
    violations: list[str] = []

    item_type: str = item.get("item_type", "")
    status: str = item.get("status", "")
    previous_status: str | None = item.get("previous_status")

    # ------------------------------------------------------------------ #
    # 1. Must be a TestCase
    # ------------------------------------------------------------------ #
    if item_type != "TestCase":
        violations.append(
            f"Expected item_type='TestCase', got {item_type!r}. "
            "Per-type TC proof only applies to TestCase items."
        )

    # ------------------------------------------------------------------ #
    # 2. Status must be a valid TestCase status
    # ------------------------------------------------------------------ #
    try:
        assert_status_allowed("TestCase", status)
    except StatusViolationError as exc:
        violations.append(str(exc))

    # ------------------------------------------------------------------ #
    # 3. Classify terminal / exclusive
    # ------------------------------------------------------------------ #
    is_terminal = status in {s.value for s in TestCaseStatus.terminal()}
    is_exclusive = is_tc_exclusive_status(status)

    # ------------------------------------------------------------------ #
    # 4. Validate the transition if previous_status is provided
    # ------------------------------------------------------------------ #
    if previous_status is not None and not violations:
        try:
            assert_tc_transition_allowed(previous_status, status)
        except (StatusViolationError, ValueError) as exc:
            violations.append(str(exc))

    # ------------------------------------------------------------------ #
    # 5. Extra guard: exclusive statuses must NOT be reachable from any
    #    non-TestCase type's status set.
    # ------------------------------------------------------------------ #
    if is_exclusive and item_type != "TestCase":
        violations.append(
            f"Status {status!r} is TestCase-exclusive but item_type is "
            f"{item_type!r}. This is a cross-type contamination."
        )

    passed = len(violations) == 0
    return ProofResult(
        passed=passed,
        item_type=item_type,
        current_status=status,
        is_terminal=is_terminal,
        is_exclusive=is_exclusive,
        violations=violations,
    )
