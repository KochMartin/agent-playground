# Agent Platform E2E Tests

End-to-end tests that verify the three agent-platform fixes shipped in this sprint.

## Fixes covered

| Fix | Module | Test file |
|-----|--------|-----------|
| **AcpClient race condition** – concurrent `init()` calls used to race and call `transport.connect()` multiple times | `src/acp-client.js` | `test/acp-client-race.test.js` |
| **Item type misidentification** – raw type strings from the API were not normalised before lookup, so variants like `"testcase"` or `"REQUIREMENT"` fell through to an unknown-type error | `src/item-type-handler.js` | `test/item-type.test.js` |
| **Status alias mismatch** – status labels were sent to the aqua API as-is; mis-cased values (e.g. `"in progress"`) were silently rejected | `src/status-alias-resolver.js` | `test/status-alias.test.js` |

## Running the tests

```bash
# Run all tests
npm test

# Run individual suites
npm run test:race
npm run test:item-type
npm run test:status-alias
```

## Requirements

Node.js ≥ 18 (uses the built-in `node:test` runner – no extra dependencies).
