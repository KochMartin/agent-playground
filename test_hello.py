import unittest
from hello import hello


class TestHello(unittest.TestCase):
    def test_default_greeting(self):
        """Test that the default greeting says 'Hello, World!'."""
        self.assertEqual(hello(), "Hello, World!")

    def test_custom_name(self):
        """Test that a custom name is included in the greeting."""
        self.assertEqual(hello("Alice"), "Hello, Alice!")

    def test_return_type(self):
        """Test that hello() returns a string."""
        self.assertIsInstance(hello(), str)


if __name__ == "__main__":
    unittest.main()
