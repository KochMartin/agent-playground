"""
tests/test_per_type_tc_status_proof.py
========================================
Work item #71087 – qa-F1-2026-06-08 per-type TC proof

Verifies that:
- TestCase-EXCLUSIVE statuses (QA passed / QA failed / Need Rework) are
  recognised as such and cannot be assigned to other item types.
- The TC_DESIGN → READY_TO_TEST transition is the qa-f1-testcase trigger path.
- Terminal states are correctly identified.
- Invalid transitions and cross-type contamination raise errors.
"""

from __future__ import annotations

import pytest

from qa.per_type_status_proof.status_definitions import (
    TestCaseStatus,
    ALLOWED_STATUSES_BY_TYPE,
)
from qa.per_type_status_proof.workflow import (
    StatusViolationError,
    TC_TRANSITIONS,
    assert_status_allowed,
    assert_tc_transition_allowed,
    is_tc_exclusive_status,
)
from qa.per_type_status_proof.prover import ProofResult, qa_status_prover


# ======================================================================
# status_definitions
# ======================================================================

class TestStatusDefinitions:
    def test_terminal_statuses_are_exclusive(self):
        """Every terminal TC status must also be exclusive."""
        assert TestCaseStatus.terminal() == TestCaseStatus.exclusive()

    def test_exclusive_statuses_content(self):
        exclusive = {s.value for s in TestCaseStatus.exclusive()}
        assert exclusive == {"QA passed", "QA failed", "Need Rework"}

    def test_allowed_statuses_by_type_keys(self):
        assert set(ALLOWED_STATUSES_BY_TYPE.keys()) == {
            "TestCase", "Requirement", "Defect"
        }

    def test_exclusive_statuses_not_in_requirement(self):
        req_statuses = ALLOWED_STATUSES_BY_TYPE["Requirement"]
        for exclusive in TestCaseStatus.exclusive():
            assert exclusive.value not in req_statuses, (
                f"{exclusive.value!r} must not appear in Requirement statuses"
            )

    def test_exclusive_statuses_not_in_defect(self):
        defect_statuses = ALLOWED_STATUSES_BY_TYPE["Defect"]
        for exclusive in TestCaseStatus.exclusive():
            assert exclusive.value not in defect_statuses, (
                f"{exclusive.value!r} must not appear in Defect statuses"
            )


# ======================================================================
# workflow – assert_status_allowed
# ======================================================================

class TestAssertStatusAllowed:
    @pytest.mark.parametrize("status", [
        "TC design", "Ready to test",
        "QA passed", "QA failed", "Need Rework",
    ])
    def test_valid_tc_statuses(self, status):
        assert_status_allowed("TestCase", status)  # must not raise

    @pytest.mark.parametrize("bad_status", ["QA passed", "QA failed", "Need Rework"])
    def test_exclusive_statuses_rejected_for_requirement(self, bad_status):
        with pytest.raises(StatusViolationError):
            assert_status_allowed("Requirement", bad_status)

    @pytest.mark.parametrize("bad_status", ["QA passed", "QA failed", "Need Rework"])
    def test_exclusive_statuses_rejected_for_defect(self, bad_status):
        with pytest.raises(StatusViolationError):
            assert_status_allowed("Defect", bad_status)

    def test_unknown_item_type_raises(self):
        with pytest.raises(StatusViolationError, match="Unknown item type"):
            assert_status_allowed("UnknownType", "Some Status")


# ======================================================================
# workflow – assert_tc_transition_allowed
# ======================================================================

class TestTCTransitions:
    def test_tc_design_to_ready_to_test(self):
        """The qa-f1-testcase trigger path: TC design → Ready to test."""
        assert_tc_transition_allowed("TC design", "Ready to test")  # no raise

    def test_ready_to_test_to_qa_passed(self):
        assert_tc_transition_allowed("Ready to test", "QA passed")

    def test_ready_to_test_to_qa_failed(self):
        assert_tc_transition_allowed("Ready to test", "QA failed")

    def test_qa_failed_to_need_rework(self):
        assert_tc_transition_allowed("QA failed", "Need Rework")

    def test_need_rework_back_to_tc_design(self):
        assert_tc_transition_allowed("Need Rework", "TC design")

    def test_need_rework_back_to_ready_to_test(self):
        assert_tc_transition_allowed("Need Rework", "Ready to test")

    def test_qa_passed_is_terminal(self):
        """QA passed has no outgoing transitions."""
        assert TC_TRANSITIONS[TestCaseStatus.QA_PASSED] == frozenset()

    def test_invalid_transition_raises(self):
        with pytest.raises(StatusViolationError):
            assert_tc_transition_allowed("TC design", "QA passed")

    def test_invalid_transition_from_terminal_raises(self):
        with pytest.raises(StatusViolationError):
            assert_tc_transition_allowed("QA passed", "TC design")

    def test_backwards_skip_raises(self):
        with pytest.raises(StatusViolationError):
            assert_tc_transition_allowed("Ready to test", "TC design")


# ======================================================================
# workflow – is_tc_exclusive_status
# ======================================================================

class TestIsTCExclusiveStatus:
    @pytest.mark.parametrize("status", ["QA passed", "QA failed", "Need Rework"])
    def test_returns_true_for_exclusive(self, status):
        assert is_tc_exclusive_status(status) is True

    @pytest.mark.parametrize("status", ["TC design", "Ready to test", "New", "Fixed"])
    def test_returns_false_for_non_exclusive(self, status):
        assert is_tc_exclusive_status(status) is False


# ======================================================================
# prover – qa_status_prover (main entry point)
# ======================================================================

class TestQAStatusProver:

    # ------------------------------------------------------------------ #
    # Happy-path: trigger path TC design → Ready to test
    # ------------------------------------------------------------------ #
    def test_trigger_path_ready_to_test(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "Ready to test",
            "previous_status": "TC design",
        })
        assert result.passed
        assert not result.is_terminal
        assert not result.is_exclusive
        assert result.violations == []

    # ------------------------------------------------------------------ #
    # Terminal: QA passed
    # ------------------------------------------------------------------ #
    def test_terminal_qa_passed(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "QA passed",
            "previous_status": "Ready to test",
        })
        assert result.passed
        assert result.is_terminal
        assert result.is_exclusive
        assert result.violations == []

    # ------------------------------------------------------------------ #
    # Terminal: QA failed
    # ------------------------------------------------------------------ #
    def test_terminal_qa_failed(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "QA failed",
            "previous_status": "Ready to test",
        })
        assert result.passed
        assert result.is_terminal
        assert result.is_exclusive

    # ------------------------------------------------------------------ #
    # Terminal: Need Rework (item 71087 current state)
    # ------------------------------------------------------------------ #
    def test_terminal_need_rework(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "Need Rework",
            "previous_status": "QA failed",
        })
        assert result.passed
        assert result.is_terminal
        assert result.is_exclusive

    # ------------------------------------------------------------------ #
    # Failure: wrong item type with exclusive status
    # ------------------------------------------------------------------ #
    def test_requirement_with_exclusive_status_fails(self):
        result = qa_status_prover({
            "item_type": "Requirement",
            "status": "QA passed",
        })
        assert not result.passed
        assert any("not allowed" in v for v in result.violations)

    def test_defect_with_exclusive_status_fails(self):
        result = qa_status_prover({
            "item_type": "Defect",
            "status": "Need Rework",
        })
        assert not result.passed

    # ------------------------------------------------------------------ #
    # Failure: invalid transition
    # ------------------------------------------------------------------ #
    def test_invalid_transition_detected(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "QA passed",
            "previous_status": "TC design",   # must go through Ready to test
        })
        assert not result.passed
        assert any("transition" in v.lower() or "not allowed" in v.lower()
                   for v in result.violations)

    # ------------------------------------------------------------------ #
    # Failure: entirely wrong item type
    # ------------------------------------------------------------------ #
    def test_wrong_item_type_detected(self):
        result = qa_status_prover({
            "item_type": "Requirement",
            "status": "TC design",
        })
        assert not result.passed

    # ------------------------------------------------------------------ #
    # ProofResult shape
    # ------------------------------------------------------------------ #
    def test_proof_result_is_dataclass(self):
        result = qa_status_prover({
            "item_type": "TestCase",
            "status": "QA passed",
            "previous_status": "Ready to test",
        })
        assert isinstance(result, ProofResult)
        assert result.item_type == "TestCase"
        assert result.current_status == "QA passed"
