const { isPalindrome } = require('./isPalindrome');

// Simple test runner (no external dependencies)
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL: ${description}`);
    console.log(`         ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('\n=== isPalindrome Unit Tests ===\n');

// Edge cases
test('empty string returns true', () => {
  assert(isPalindrome('') === true, 'Expected true for ""');
});

test('single character returns true', () => {
  assert(isPalindrome('a') === true, 'Expected true for "a"');
  assert(isPalindrome('Z') === true, 'Expected true for "Z"');
});

// Case-insensitive palindromes
test('mixed-case palindrome "Racecar" returns true', () => {
  assert(isPalindrome('Racecar') === true, 'Expected true for "Racecar"');
});

test('all-lowercase palindrome "racecar" returns true', () => {
  assert(isPalindrome('racecar') === true, 'Expected true for "racecar"');
});

test('all-uppercase palindrome "LEVEL" returns true', () => {
  assert(isPalindrome('LEVEL') === true, 'Expected true for "LEVEL"');
});

test('mixed-case "MadaM" returns true', () => {
  assert(isPalindrome('MadaM') === true, 'Expected true for "MadaM"');
});

// Non-palindromes
test('clear non-palindrome "hello" returns false', () => {
  assert(isPalindrome('hello') === false, 'Expected false for "hello"');
});

test('non-palindrome "world" returns false', () => {
  assert(isPalindrome('world') === false, 'Expected false for "world"');
});

// Unicode
test('unicode palindrome "上海自来水来自海上" returns true', () => {
  assert(isPalindrome('上海自来水来自海上') === true, 'Expected true for unicode palindrome');
});

test('unicode non-palindrome "こんにちは" returns false', () => {
  assert(isPalindrome('こんにちは') === false, 'Expected false for "こんにちは"');
});

// Numeric string
test('numeric palindrome "12321" returns true', () => {
  assert(isPalindrome('12321') === true, 'Expected true for "12321"');
});

test('numeric non-palindrome "12345" returns false', () => {
  assert(isPalindrome('12345') === false, 'Expected false for "12345"');
});

// Type guard
test('throws TypeError for non-string input', () => {
  let threw = false;
  try { isPalindrome(123); } catch (e) { threw = e instanceof TypeError; }
  assert(threw, 'Expected TypeError for numeric input');
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
