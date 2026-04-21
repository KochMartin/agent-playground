"""A simple hello world module."""


def greet(name: str = "World") -> str:
    """Return a greeting string for the given name.

    Args:
        name: The name to greet. Defaults to "World".

    Returns:
        A greeting string of the form "Hello, <name>!".
    """
    return f"Hello, {name}!"


def main() -> None:
    """Print the default hello world message."""
    print(greet())


if __name__ == "__main__":
    main()
