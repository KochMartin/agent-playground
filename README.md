# agent-playground

## `toCsv(rows)`

Serializes an array of plain objects into a CSV string (RFC 4180).

### Features
- Header row derived from the keys of the first object
- One row per object, in the same column order as the header
- Values are properly escaped: commas, double-quotes, and newlines trigger
  double-quote wrapping; embedded double-quotes are doubled

### Usage

```js
const { toCsv } = require('./src/toCsv');

const rows = [
  { id: 1, name: 'Alice', department: 'Engineering' },
  { id: 2, name: 'Bob',   department: 'Sales, East' },
];

console.log(toCsv(rows));
// id,name,department
// 1,Alice,Engineering
// 2,Bob,"Sales, East"
```

### Running the tests

```bash
node --test src/toCsv.test.js
```

All 10 unit tests should pass (empty input, simple values, multi-row, escaping commas, double-quotes, newlines, null/undefined, column ordering, numeric/boolean).
