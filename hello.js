/**
 * Simple Hello World script.
 * Exports a greeting function and prints it when run directly.
 */

/**
 * Returns a greeting string for the given name.
 * @param {string} [name="World"] - The name to greet.
 * @returns {string} The greeting message.
 */
function greet(name = "World") {
  return `Hello, ${name}!`;
}

// Print the greeting when this file is executed directly
if (require.main === module) {
  console.log(greet());
}

module.exports = { greet };
