const { helloWorld } = require("./hello");

test("helloWorld returns the correct greeting", () => {
  expect(helloWorld()).toBe("Hello, World!");
});
