# ping-api

Minimal Express HTTP server exposing a health-check endpoint.

## Endpoints

| Method | Path    | Response                  |
|--------|---------|---------------------------|
| GET    | `/ping` | `200 { "status": "ok" }` |

## Getting started

```bash
npm install
npm start       # starts server on port 3000 (override with PORT env var)
```

## Running tests

```bash
npm test
```

Tests use [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) and produce a coverage report.
