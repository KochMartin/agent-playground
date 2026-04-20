"""Tests for the simple hello world script."""
import subprocess
import sys

from hello import hello


def test_hello_returns_correct_string():
    """Test that hello() returns the expected greeting."""
    assert hello() == "Hello, World!"


def test_hello_script_output():
    """Test that running hello.py as a script prints the greeting."""
    result = subprocess.run(
        [sys.executable, "hello.py"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert result.stdout.strip() == "Hello, World!"
