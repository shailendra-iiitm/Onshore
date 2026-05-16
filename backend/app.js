const express = require('express');
const cors    = require('cors');
const apiRoutes = require('./src/routes/index');
const app = express();

// Support comma-separated origins: "https://onshore-labs.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      // Return null (not an error) so CORS sends 403 — not a 500
      console.warn(`CORS blocked: ${origin}`);
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json());
// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', apiRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
module.exports = app;
