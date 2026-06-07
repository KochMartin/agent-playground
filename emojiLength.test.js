/**
 * Unit tests for emojiLength()
 * Run with: node emojiLength.test.js
 */

const { emojiLength } = require('./emojiLength');

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description} — expected ${expected}, got ${actual}`);
    failed++;
  }
}

console.log('\n=== emojiLength() Unit Tests ===\n');

// TC-1: Empty string
assert('Empty string returns 0', emojiLength(''), 0);

// TC-2: ASCII word
assert('ASCII "hello" returns 5', emojiLength('hello'), 5);

// TC-3: Three emoji characters
// 😀 is U+1F600 — a surrogate pair in UTF-16; .length would return 6, not 3
assert('Three emoji "😀😀😀" returns 3', emojiLength('😀😀😀'), 3);

// TC-4: CJK characters
assert('CJK "漢字" returns 2', emojiLength('漢字'), 2);

// TC-5: Mixed string  — ASCII + emoji + CJK + Greek + Arabic + Hebrew
const mixed = 'Hi 🚀 漢字 αβγ مرحبا שלום 🎌';
const mixedExpected = Array.from(mixed).length; // ground-truth via same method
assert(
  `Mixed string has ${mixedExpected} code points`,
  emojiLength(mixed),
  mixedExpected,
);

// TC-6: Flag emoji (made of two Regional Indicator symbols — 4 UTF-16 code units, 2 code points)
assert('German flag 🇩🇪 returns 2 code points', emojiLength('🇩🇪'), 2);

// TC-7: String that would mislead UTF-16 .length
assert(
  'JS .length would be wrong for "😀😀😀" (demonstrating the problem)',
  '😀😀😀'.length,   // UTF-16 → 6
  6,
);
assert(
  'emojiLength correctly returns 3 for "😀😀😀"',
  emojiLength('😀😀😀'),
  3,
);

// TC-8: Numbers / symbols
assert('"12345" returns 5', emojiLength('12345'), 5);

// TC-9: Single high-plane emoji
assert('Single rocket 🚀 returns 1', emojiLength('🚀'), 1);

// TC-10: Accented Latin (BMP characters, each is 1 code point and 1 code unit)
assert('"ÀÁÂÃÄÅÆÇÈÉ" returns 10', emojiLength('ÀÁÂÃÄÅÆÇÈÉ'), 10);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
