const { parseCsvLine } = require('./parseCsvLine');

// Minimal test harness (no external dependencies)
let passed = 0;
let failed = 0;
const failures = [];

function assert(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${description}`);
  } else {
    failed++;
    const msg = `  ✗ ${description}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.log(msg);
  }
}

console.log('\n=== parseCsvLine unit tests ===\n');

// Basic cases
assert('empty string returns one empty field',
  parseCsvLine(''), ['']);

assert('single field, no comma',
  parseCsvLine('hello'), ['hello']);

assert('two simple fields',
  parseCsvLine('a,b'), ['a', 'b']);

assert('three simple fields',
  parseCsvLine('one,two,three'), ['one', 'two', 'three']);

// Quoted fields
assert('quoted field without comma',
  parseCsvLine('"hello"'), ['hello']);

assert('quoted field containing comma',
  parseCsvLine('"hello, world"'), ['hello, world']);

assert('quoted field among others',
  parseCsvLine('a,"b,c",d'), ['a', 'b,c', 'd']);

// Escaped quotes
assert('escaped double-quote inside quoted field',
  parseCsvLine('"say ""hi"""'), ['say "hi"']);

assert('escaped quote mid-field',
  parseCsvLine('"She said ""hello"", he replied"'),
  ['She said "hello", he replied']);

// Empty fields
assert('leading comma → leading empty field',
  parseCsvLine(',b'), ['', 'b']);

assert('trailing comma → trailing empty field',
  parseCsvLine('a,'), ['a', '']);

assert('two commas → three fields, middle empty',
  parseCsvLine('a,,c'), ['a', '', 'c']);

// Mixed
assert('mix of quoted and unquoted',
  parseCsvLine('name,"Smith, John",age,30'),
  ['name', 'Smith, John', 'age', '30']);

assert('numbers and spaces',
  parseCsvLine('1, 2 , 3'), ['1', ' 2 ', ' 3']);

assert('fully quoted fields',
  parseCsvLine('"alpha","beta","gamma"'), ['alpha', 'beta', 'gamma']);

// Summary
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
if (failed > 0) {
  process.exitCode = 1;
}

// Export results for report generation
module.exports = { passed, failed, failures };
