#!/usr/bin/env node

/**
 * A simple hello world script.
 */
function helloWorld() {
  return "Hello, World!";
}

console.log(helloWorld());

module.exports = { helloWorld };
