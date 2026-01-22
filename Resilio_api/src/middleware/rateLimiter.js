/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  // Time window
  windowMs: config.rateLimit.windowMs,

  // Max requests per window per IP
  max: config.rateLimit.maxRequests,

  // Return rate limit info in headers
  standardHeaders: true,

  // Disable X-RateLimit-* headers (using standard headers instead)
  legacyHeaders: false,

  // Skip successful requests from counting? No, count all requests
  skipSuccessfulRequests: false,

  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
    });
  },

  // Key generator (use IP address)
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },

  // Skip rate limiting for health checks
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/v1/health';
  },
});

/**
 * Stricter rate limiter for search endpoint
 * (Full-text search is more expensive)
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      query: req.query.search,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'SEARCH_RATE_LIMIT_EXCEEDED',
        message: 'Too many search requests. Please wait before searching again.',
        retryAfter: 60,
      },
    });
  },

  // Only apply to requests with search parameter
  skip: (req) => {
    return !req.query.search;
  },
});

module.exports = {
  apiLimiter,
  searchLimiter,
};
