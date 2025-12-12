// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

const pool = require('./config/database'); // mysql2/promise pool

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health route
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Quick DB Test Route (basic query)
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    return res.json({ message: 'DB Connected!', result: rows[0].result });
  } catch (err) {
    console.error('DB test failed:', err.message || err);
    return res.status(500).json({
      message: 'DB connection error',
      error: err.message || String(err),
    });
  }
});

// DB Tables list
app.get('/test-db-tables', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    return res.json({ message: 'Tables in DB', tables: rows });
  } catch (err) {
    console.error('DB tables fetch failed:', err.message || err);
    return res.status(500).json({ message: 'DB error', error: err.message || String(err) });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Fallback Error Handler (hides stack in production)
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const payload = { message: err && err.message ? err.message : 'Something went wrong!' };
  if (process.env.NODE_ENV !== 'production' && err && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

// Start server with optional DB-check skip
const PORT = process.env.PORT || 5000;
const SKIP_DB_CHECK = process.env.SKIP_DB_CHECK === 'true';

async function startServer() {
  try {
    if (!SKIP_DB_CHECK) {
      // Test DB connection before starting
      await pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
    } else {
      try {
        // try to run a test query but don't fail startup if it errors
        await pool.query('SELECT 1').then(() => console.log('✅ DB test ok (SKIP_DB_CHECK=true)'));
      } catch (e) {
        console.warn('⚠️ SKIP_DB_CHECK=true and DB test failed (server will still start):', e.message || e);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      try {
        server.close(async () => {
          try {
            if (pool && typeof pool.end === 'function') {
              await pool.end();
              console.log('✅ DB pool closed.');
            }
          } catch (err) {
            console.warn('Error closing DB pool:', err && err.message ? err.message : err);
          } finally {
            process.exit(0);
          }
        });
      } catch (err) {
        console.error('Error during shutdown:', err && err.message ? err.message : err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('❌ Startup Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

startServer();
