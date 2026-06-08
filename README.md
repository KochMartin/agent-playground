# Number-Theory Utilities

Three small, dependency-free number-theory helper functions implemented in plain JavaScript.

---

## Functions

### `gcd(a, b)` — Greatest Common Divisor

Returns the greatest common divisor of two positive integers using the **Euclidean algorithm**.

**Signature**
```js
const { gcd } = require('./src/gcd');
gcd(a: number, b: number): number
```

**Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `a` | positive integer | First operand |
| `b` | positive integer | Second operand |

**Returns** — The largest integer that divides both `a` and `b` without remainder.

**Throws** — `Error` if either argument is not a positive integer.

**Usage examples**
```js
const { gcd } = require('./src/gcd');

gcd(48, 18);  // → 6
gcd(12, 8);   // → 4
gcd(7, 7);    // → 7
gcd(17, 11);  // → 1  (two primes share no common factor)
```

---

### `lcm(a, b)` — Least Common Multiple

Returns the least common multiple of two positive integers.  
Implemented via the identity **lcm(a, b) = (a / gcd(a, b)) × b**.

**Signature**
```js
const { lcm } = require('./src/lcm');
lcm(a: number, b: number): number
```

**Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `a` | positive integer | First operand |
| `b` | positive integer | Second operand |

**Returns** — The smallest positive integer that is divisible by both `a` and `b`.

**Throws** — `Error` if either argument is not a positive integer.

**Usage examples**
```js
const { lcm } = require('./src/lcm');

lcm(4, 6);    // → 12
lcm(12, 15);  // → 60
lcm(1, 13);   // → 13
lcm(11, 13);  // → 143  (product of two primes)
```

---

### `isPrime(n)` — Primality Test

Returns `true` if `n` is a prime number, `false` otherwise.  
Uses **trial division** up to √n with an early-exit optimisation for even numbers.

**Signature**
```js
const { isPrime } = require('./src/isPrime');
isPrime(n: number): boolean
```

**Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `n` | positive integer ≥ 1 | The number to test |

**Returns** — `true` if `n` is prime, `false` if it is composite or 1.

**Throws** — `Error` if `n` is not a positive integer.

**Usage examples**
```js
const { isPrime } = require('./src/isPrime');

isPrime(1);     // → false  (1 is not prime by definition)
isPrime(2);     // → true
isPrime(13);    // → true
isPrime(25);    // → false  (5 × 5)
isPrime(7919);  // → true   (1000th prime)
```

---

## Running the tests

```bash
node --test
```

All test files live in the `tests/` directory and use Node's built-in `node:test` runner — no extra dependencies required.
