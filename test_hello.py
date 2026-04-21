"""Tests for the hello world module."""

import io
import sys

import pytest

from hello import greet, main


class TestGreet:
    """Tests for the greet() function."""

    def test_default_greeting(self):
        """greet() with no arguments should return 'Hello, World!'."""
        assert greet() == "Hello, World!"

    def test_custom_name(self):
        """greet() with a custom name should include that name."""
        assert greet("Alice") == "Hello, Alice!"

    def test_another_name(self):
        """greet() with another custom name should include that name."""
        assert greet("Bob") == "Hello, Bob!"

    def test_returns_string(self):
        """greet() should always return a str."""
        assert isinstance(greet(), str)
        assert isinstance(greet("Test"), str)

    def test_empty_string_name(self):
        """greet() with an empty string should still work."""
        assert greet("") == "Hello, !"


class TestMain:
    """Tests for the main() function."""

    def test_main_prints_hello_world(self, capsys):
        """main() should print 'Hello, World!' to stdout."""
        main()
        captured = capsys.readouterr()
        assert captured.out == "Hello, World!\n"
