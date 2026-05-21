# Agent Playground

A simple Next.js API with a ping endpoint for health checks.

## Features

- **GET /api/ping** - A simple health check endpoint that returns a "pong" response with a timestamp

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Testing

Run the test suite:

```bash
npm test
```

Or run tests in watch mode:

```bash
npm run test:watch
```

## API Endpoints

### GET /api/ping

Health check endpoint that verifies the API is running.

**Request:**
```bash
curl http://localhost:3000/api/ping
```

**Response:**
```json
{
  "status": "pong",
  "timestamp": "2024-05-21T13:45:30.123Z"
}
```

**Status Code:** 200 OK

**Supported Methods:** GET only

Other HTTP methods (POST, DELETE, etc.) will return 405 Method Not Allowed.

## Project Structure

```
.
├── src/
│   └── pages/
│       └── api/
│           └── ping.js       # Ping endpoint handler
├── __tests__/
│   └── api/
│       └── ping.test.js      # Tests for ping endpoint
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup file
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
└── README.md                 # This file
```

## Testing

The ping endpoint includes comprehensive test coverage:

- ✅ Returns 200 status code for GET requests
- ✅ Returns "pong" status in response
- ✅ Includes a valid ISO timestamp in response
- ✅ Returns 405 for non-GET requests (POST, DELETE, etc.)
- ✅ Response is valid JSON

Run tests with:
```bash
npm test
```

## License

ISC
