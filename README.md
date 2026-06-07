# agent-playground

Small utility functions implemented as part of the soak test series.

## toUpper

Returns the uppercase version of a string.

```js
const { toUpper } = require('./src/toUpper');

toUpper('hello');  // → 'HELLO'
toUpper('MiXeD'); // → 'MIXED'
toUpper('');      // → ''
```

### Run tests

```bash
node src/toUpper.test.js
```
