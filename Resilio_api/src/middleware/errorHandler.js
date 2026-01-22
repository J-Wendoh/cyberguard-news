/**
 * Error Handling Middleware
 * Centralized error processing and response formatting
 */

const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message);
  }
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  const error = ApiError.notFound(`Endpoint ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Handle PostgreSQL errors
  if (err.code && err.code.startsWith('23')) {
    statusCode = 400;
    code = 'DATABASE_CONSTRAINT_ERROR';
    message = 'Database constraint violation';
  }

  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database connection failed';
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    code = 'CORS_ERROR';
    message = 'Cross-origin request blocked';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      code,
      path: req.path,
      method: req.method,
    });
  }

  // Build response
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Include details if available and not in production
  if (err.details) {
    response.error.details = err.details;
  }

  // Include stack trace in development only
  if (config.env === 'development' && err.stack) {
    response.error.stack = err.stack.split('\n');
  }

  res.status(statusCode).json(response);
}

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler,
};
