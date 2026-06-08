'use strict';

const express = require('express');
const app = express();

/**
 * GET /ping
 * Health-check endpoint.
 * Returns HTTP 200 with JSON body { status: 'ok' }.
 */
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
