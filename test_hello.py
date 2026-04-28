"""Tests for the hello world script."""
import io
import os
import sys
import unittest

# Ensure the repo directory is on the path so 'hello' can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from hello import main  # noqa: E402


class TestHello(unittest.TestCase):
    def test_prints_hello_world(self):
        """Test that main() prints 'Hello, World!' to stdout."""
        captured = io.StringIO()
        sys.stdout = captured
        try:
            main()
        finally:
            sys.stdout = sys.__stdout__
        self.assertEqual(captured.getvalue().strip(), "Hello, World!")


if __name__ == "__main__":
    unittest.main(verbosity=2)
