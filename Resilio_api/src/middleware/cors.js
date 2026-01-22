/**
 * CORS Configuration Middleware
 * Restricts API access to allowed origins only
 */

const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * CORS options with origin validation
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    // In production, you might want to restrict this
    if (!origin) {
      if (config.env === 'development') {
        return callback(null, true);
      }
      // In production, allow no-origin requests (server-to-server)
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Allowed methods
  methods: ['GET', 'HEAD', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'X-Requested-With',
  ],

  // Expose these headers to the client
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  // Cache preflight requests for 1 hour
  maxAge: 3600,

  // Don't pass credentials (no cookies needed)
  credentials: false,
};

module.exports = cors(corsOptions);
