// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database.js');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err?.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  // 🔑 MongoDB connect first
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // Graceful shutdown (MongoDB)
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server...`);
    await server.close();
    await require('mongoose').connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
