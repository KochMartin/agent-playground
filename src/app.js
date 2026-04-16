const express = require('express');

const app = express();

app.use(express.json());

// GET /ping – health-check endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;

// Start the server only when this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
