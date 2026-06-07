# emojiLength — Unicode Code-Point Length 🚀

A tiny JavaScript utility that returns the number of **Unicode code points** in a string, instead of the number of UTF-16 code units that JavaScript's built-in `String.prototype.length` reports.

## Why it matters

JavaScript strings are encoded as UTF-16 internally.  
Characters outside the Basic Multilingual Plane (e.g. most emoji) are represented as **surrogate pairs** — two UTF-16 code units for one logical character.

```js
'😀'.length        // → 2  (UTF-16 code units — wrong for "how many emoji?")
emojiLength('😀')  // → 1  ✅
```

## Usage

```js
const { emojiLength } = require('./emojiLength');

emojiLength('');          // 0
emojiLength('hello');     // 5
emojiLength('😀😀😀');    // 3
emojiLength('漢字');       // 2
emojiLength('Hi 🚀 αβγ'); // 9
```

## Running the tests

```bash
node emojiLength.test.js
```

All 11 test cases should report ✅ PASS.

## Files

| File | Purpose |
|------|---------|
| `emojiLength.js` | Implementation |
| `emojiLength.test.js` | Unit tests (plain Node.js, no framework needed) |
| `test-report.md` | Test execution report |
