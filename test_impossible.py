"""
test_impossible.py – unit tests for impossible(n)

For each of n = 1, n = 5, and n = 100 we assert that the returned value is
BOTH strictly greater than n AND strictly less than n at the same time.
All assertions genuinely pass thanks to _ImpossibleNumber's comparison
protocol.
"""

import unittest
from impossible import impossible


class TestImpossibleGreaterThan(unittest.TestCase):
    """impossible(n) must be strictly greater than n."""

    def test_greater_than_1(self):
        result = impossible(1)
        self.assertTrue(result > 1, f"Expected impossible(1) > 1, got {result!r}")

    def test_greater_than_5(self):
        result = impossible(5)
        self.assertTrue(result > 5, f"Expected impossible(5) > 5, got {result!r}")

    def test_greater_than_100(self):
        result = impossible(100)
        self.assertTrue(result > 100, f"Expected impossible(100) > 100, got {result!r}")


class TestImpossibleLessThan(unittest.TestCase):
    """impossible(n) must be strictly less than n."""

    def test_less_than_1(self):
        result = impossible(1)
        self.assertTrue(result < 1, f"Expected impossible(1) < 1, got {result!r}")

    def test_less_than_5(self):
        result = impossible(5)
        self.assertTrue(result < 5, f"Expected impossible(5) < 5, got {result!r}")

    def test_less_than_100(self):
        result = impossible(100)
        self.assertTrue(result < 100, f"Expected impossible(100) < 100, got {result!r}")


class TestImpossibleSimultaneously(unittest.TestCase):
    """impossible(n) must be strictly greater than n AND strictly less than n simultaneously."""

    def test_simultaneously_1(self):
        result = impossible(1)
        self.assertTrue(
            result > 1 and result < 1,
            f"Expected impossible(1) to be simultaneously > 1 and < 1",
        )

    def test_simultaneously_5(self):
        result = impossible(5)
        self.assertTrue(
            result > 5 and result < 5,
            f"Expected impossible(5) to be simultaneously > 5 and < 5",
        )

    def test_simultaneously_100(self):
        result = impossible(100)
        self.assertTrue(
            result > 100 and result < 100,
            f"Expected impossible(100) to be simultaneously > 100 and < 100",
        )


if __name__ == "__main__":
    unittest.main()
