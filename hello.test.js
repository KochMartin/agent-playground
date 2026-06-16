/**
 * Tests for the hello world script (hello.js).
 * Uses Node's built-in assert module — no extra dependencies required.
 */

const assert = require("assert");
const { greet } = require("./hello");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log("\nRunning hello.js tests...\n");

test("greet() with no arguments returns 'Hello, World!'", () => {
  assert.strictEqual(greet(), "Hello, World!");
});

test("greet('Alice') returns 'Hello, Alice!'", () => {
  assert.strictEqual(greet("Alice"), "Hello, Alice!");
});

test("greet('Bob') returns 'Hello, Bob!'", () => {
  assert.strictEqual(greet("Bob"), "Hello, Bob!");
});

test("greet returns a string", () => {
  assert.strictEqual(typeof greet(), "string");
});

test("greet with empty string returns 'Hello, !'", () => {
  assert.strictEqual(greet(""), "Hello, !");
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
