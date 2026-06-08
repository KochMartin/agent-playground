# String Utility Functions

Six string utility functions implemented for Requirement [#71052].  
All 37 unit tests pass (see `results.json`).

---

## Functions

### 1. `reverse(s)`

Returns the reversed version of the input string.

```js
const { reverse } = require('./src/stringUtils');

reverse('hello');       // → 'olleh'
reverse('racecar');     // → 'racecar'
reverse('hello world'); // → 'dlrow olleh'
reverse('');            // → ''
```

---

### 2. `capitalize(s)`

Capitalises the **first** character of the string; the rest of the string is left unchanged.

```js
const { capitalize } = require('./src/stringUtils');

capitalize('hello');  // → 'Hello'
capitalize('Hello');  // → 'Hello'
capitalize('hELLO');  // → 'HELLO'
capitalize('');       // → ''
```

---

### 3. `countVowels(s)`

Counts the number of vowel characters (`a e i o u`, case-insensitive).

```js
const { countVowels } = require('./src/stringUtils');

countVowels('hello');     // → 2
countVowels('AEIOU');     // → 5
countVowels('Education'); // → 5
countVowels('gym');       // → 0
countVowels('');          // → 0
```

---

### 4. `truncate(s, n)`

Truncates `s` to at most `n` characters. If the string is longer than `n`, it is cut and `'...'` is appended.

```js
const { truncate } = require('./src/stringUtils');

truncate('hello world', 5);  // → 'hello...'
truncate('hello', 10);       // → 'hello'
truncate('hello', 5);        // → 'hello'
truncate('hello', 0);        // → '...'
truncate('', 5);             // → ''
```

---

### 5. `slugify(s)`

Converts a string to a URL-friendly slug: lowercases, replaces spaces with hyphens, strips all non-alphanumeric characters (except hyphens), and collapses consecutive hyphens.

```js
const { slugify } = require('./src/stringUtils');

slugify('Hello World');    // → 'hello-world'
slugify('Hello, World!');  // → 'hello-world'
slugify('foo   bar');      // → 'foo-bar'
slugify('Item 42 Final');  // → 'item-42-final'
slugify('');               // → ''
```

---

### 6. `wordCount(s)`

Counts the number of whitespace-delimited words. Returns `0` for an empty or whitespace-only string.

```js
const { wordCount } = require('./src/stringUtils');

wordCount('hello world');      // → 2
wordCount('one  two   three'); // → 3
wordCount('hello');            // → 1
wordCount('');                 // → 0
wordCount('   ');              // → 0
```

---

## Running Tests

```bash
node --test src/__tests__/stringUtils.test.js
```

Expected output: **37 tests, 0 failures**.

## Test Results Summary

See [`results.json`](./results.json) for a machine-readable summary.

| Suite       | Passed | Failed |
|-------------|--------|--------|
| reverse     | 6      | 0      |
| capitalize  | 6      | 0      |
| countVowels | 6      | 0      |
| truncate    | 7      | 0      |
| slugify     | 6      | 0      |
| wordCount   | 6      | 0      |
| **Total**   | **37** | **0**  |
