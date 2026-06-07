const { reverseString } = require('./reverseString');

const tests = [
  { input: 'hello',   expected: 'olleh' },
  { input: 'abcde',   expected: 'edcba' },
  { input: '',        expected: '' },
  { input: 'a',       expected: 'a' },
  { input: 'racecar', expected: 'racecar' },
  { input: '12345',   expected: '54321' },
];

let passed = 0;
let failed = 0;

for (const { input, expected } of tests) {
  const result = reverseString(input);
  if (result === expected) {
    console.log(`PASS  reverseString("${input}") => "${result}"`);
    passed++;
  } else {
    console.error(`FAIL  reverseString("${input}") => "${result}" (expected "${expected}")`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
