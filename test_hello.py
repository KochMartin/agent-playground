"""Tests for the hello world script."""

import unittest

from hello import hello


class TestHello(unittest.TestCase):
    """Test cases for the hello() function."""

    def test_hello_default(self):
        """hello() with no arguments should return 'Hello, World!'."""
        self.assertEqual(hello(), "Hello, World!")

    def test_hello_with_name(self):
        """hello() with a name argument should include that name."""
        self.assertEqual(hello("Alice"), "Hello, Alice!")

    def test_hello_with_different_name(self):
        """hello() should work with any string name."""
        self.assertEqual(hello("Python"), "Hello, Python!")

    def test_hello_returns_string(self):
        """hello() should always return a string."""
        self.assertIsInstance(hello(), str)
        self.assertIsInstance(hello("Bob"), str)


if __name__ == "__main__":
    unittest.main()
