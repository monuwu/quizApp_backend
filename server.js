const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { errorHandler } = require('./app/middleware/errorHandler');
const quizRoutes = require('./app/routes/quizRoutes');
const attemptRoutes = require('./app/routes/attemptRoutes');
const authRoutes = require('./app/routes/authRoutes');
const levelRoutes = require('./app/routes/levelRoutes');
const agentRoutes = require('./app/routes/agentRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Quiz API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/agents', agentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ✅ Prisma handles DB connection (Neon)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
