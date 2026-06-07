const { toUpper } = require('./toUpper');

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅  PASS  ${description}`);
    return true;
  } else {
    console.error(`  ❌  FAIL  ${description}`);
    console.error(`         expected: ${JSON.stringify(expected)}`);
    console.error(`         received: ${JSON.stringify(actual)}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

function run(description, actual, expected) {
  if (assert(description, actual, expected)) passed++;
  else failed++;
}

console.log('\ntoUpper – unit tests\n');

run('lowercase word "hello"',         toUpper('hello'),   'HELLO');
run('mixed-case word "MiXeD"',        toUpper('MiXeD'),   'MIXED');
run('empty string ""',                toUpper(''),         '');

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
