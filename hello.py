"""A simple hello world script."""


def hello(name: str = "World") -> str:
    """Return a hello greeting for the given name.

    Args:
        name: The name to greet. Defaults to "World".

    Returns:
        A greeting string in the form "Hello, <name>!".
    """
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(hello())
