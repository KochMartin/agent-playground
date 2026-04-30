const { hello } = require("./hello");

describe("hello", () => {
  test('returns "Hello, World!" when called with no arguments', () => {
    expect(hello()).toBe("Hello, World!");
  });

  test('returns a personalised greeting when a name is provided', () => {
    expect(hello("Alice")).toBe("Hello, Alice!");
  });

  test('handles an empty string argument', () => {
    expect(hello("")).toBe("Hello, !");
  });
});
