/**
 * A simple hello world script.
 * @param {string} [name="World"] - The name to greet.
 * @returns {string} The greeting message.
 */
function hello(name = "World") {
  return `Hello, ${name}!`;
}

module.exports = { hello };

// Run directly
if (require.main === module) {
  console.log(hello());
}
