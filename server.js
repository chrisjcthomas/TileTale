/**
 * Main server entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Create Express app
const app = express();

// Apply security middleware
app.use(helmet());

// Configure CORS
app.use(cors(config.cors));

// Request logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = config.nodeEnv === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    message
  });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

module.exports = app; // Export for testing
