# Agents Playground API

A simple Express.js API server.

## Endpoints

### `GET /ping`

Health-check endpoint. Returns a JSON object confirming the server is running.

**Response**

```json
{ "status": "ok" }
```

**Example**

```bash
curl http://localhost:3000/ping
# {"status":"ok"}
```

## Development

```bash
npm install
npm start        # start server on port 3000
npm test         # run tests
```
