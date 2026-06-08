"""
per_type_status_proof.workflow
================================
Allowed state-machine transitions for TestCase items and a generic
transition-guard that enforces per-type status exclusivity.
"""

from __future__ import annotations
from typing import Mapping

from .status_definitions import (
    TestCaseStatus,
    ALLOWED_STATUSES_BY_TYPE,
)

# Directed transition graph for TestCase items.
# Format:  current_status -> set of reachable next statuses
TC_TRANSITIONS: dict[TestCaseStatus, frozenset[TestCaseStatus]] = {
    TestCaseStatus.TC_DESIGN: frozenset(
        {TestCaseStatus.READY_TO_TEST}
    ),
    TestCaseStatus.READY_TO_TEST: frozenset(
        {TestCaseStatus.QA_PASSED, TestCaseStatus.QA_FAILED}
    ),
    TestCaseStatus.QA_PASSED: frozenset(),          # terminal
    TestCaseStatus.QA_FAILED: frozenset(
        {TestCaseStatus.NEED_REWORK}
    ),
    TestCaseStatus.NEED_REWORK: frozenset(
        {TestCaseStatus.TC_DESIGN, TestCaseStatus.READY_TO_TEST}
    ),
}


class StatusViolationError(ValueError):
    """Raised when a status transition or assignment breaks per-type rules."""


def assert_status_allowed(item_type: str, status: str) -> None:
    """
    Raise :class:`StatusViolationError` if *status* is not permitted for
    *item_type*.

    Parameters
    ----------
    item_type:
        Aqua item type string, e.g. ``"TestCase"``, ``"Requirement"``.
    status:
        The proposed status value.
    """
    allowed = ALLOWED_STATUSES_BY_TYPE.get(item_type)
    if allowed is None:
        raise StatusViolationError(f"Unknown item type: {item_type!r}")
    if status not in allowed:
        raise StatusViolationError(
            f"Status {status!r} is not allowed for item type {item_type!r}. "
            f"Allowed: {sorted(allowed)}"
        )


def assert_tc_transition_allowed(
    current: TestCaseStatus | str,
    next_status: TestCaseStatus | str,
) -> None:
    """
    Raise :class:`StatusViolationError` if the TestCase transition
    ``current → next_status`` is not in the allowed graph.
    """
    current = TestCaseStatus(current)
    next_status = TestCaseStatus(next_status)
    reachable = TC_TRANSITIONS.get(current, frozenset())
    if next_status not in reachable:
        raise StatusViolationError(
            f"TestCase transition {current.value!r} → {next_status.value!r} "
            f"is not allowed. Reachable from {current.value!r}: "
            f"{sorted(s.value for s in reachable) or '(terminal)'}"
        )


def is_tc_exclusive_status(status: str) -> bool:
    """Return ``True`` if *status* is a TestCase-exclusive status."""
    return status in {s.value for s in TestCaseStatus.exclusive()}
