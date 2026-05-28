const express = require('express');

const app = express();

app.use(express.json());

/**
 * GET /ping
 * Health-check endpoint.
 * Returns { status: 'ok' }
 */
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
