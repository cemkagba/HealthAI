require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, pool } = require('./config/db');
const { runSeed } = require('./seed/seed');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const meetingRoutes = require('./routes/meetings');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const { expireOverduePosts } = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/posts',         postRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Expiry Scheduler (runs every hour) ───────────────────────────────────────
function startExpiryScheduler() {
  const runExpiry = async () => {
    const client = await pool.connect();
    try {
      await expireOverduePosts(client);
    } catch (err) {
      console.error('❌ Expiry scheduler error:', err.message);
    } finally {
      client.release();
    }
  };
  // Run immediately on startup, then every hour
  runExpiry();
  setInterval(runExpiry, 60 * 60 * 1000);
  console.log('⏰ Post expiry scheduler started (runs hourly).');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database schema ready');
    await runSeed();
    console.log('✅ Seed data applied');
    startExpiryScheduler();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HEALTH AI backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
}

startServer();
