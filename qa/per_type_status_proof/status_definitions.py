"""
per_type_status_proof.status_definitions
=========================================
Canonical status lists, split by aqua item type.

TestCase-EXCLUSIVE statuses are statuses that must NEVER appear on
Requirement, Defect, or any other item type.
"""

from __future__ import annotations
from enum import Enum, unique


@unique
class TestCaseStatus(str, Enum):
    """Statuses available exclusively on TestCase items."""

    TC_DESIGN = "TC design"
    READY_TO_TEST = "Ready to test"
    QA_PASSED = "QA passed"
    QA_FAILED = "QA failed"
    NEED_REWORK = "Need Rework"

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    @classmethod
    def terminal(cls) -> frozenset["TestCaseStatus"]:
        """Statuses that represent a finished QA verdict (no further transitions expected)."""
        return frozenset({cls.QA_PASSED, cls.QA_FAILED, cls.NEED_REWORK})

    @classmethod
    def exclusive(cls) -> frozenset["TestCaseStatus"]:
        """
        Statuses that are EXCLUSIVE to TestCase items and must never appear
        on Requirement, Defect, or other item types.
        """
        return cls.terminal()


@unique
class RequirementStatus(str, Enum):
    NEW = "New"
    IN_PROGRESS = "In Progress"
    APPROVED = "Approved"
    REJECTED = "Rejected"


@unique
class DefectStatus(str, Enum):
    NEW = "New"
    IN_PROGRESS = "In Progress"
    FIXED = "Fixed"
    CLOSED = "Closed"
    WONT_FIX = "Won't Fix"


# Convenient lookup: item-type name → allowed status set
ALLOWED_STATUSES_BY_TYPE: dict[str, frozenset[str]] = {
    "TestCase": frozenset(s.value for s in TestCaseStatus),
    "Requirement": frozenset(s.value for s in RequirementStatus),
    "Defect": frozenset(s.value for s in DefectStatus),
}
