/**
 * CyberSec Dashboard API Server
 * Main application entry point
 */

const express = require('express');
const compression = require('compression');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./config/database');

// Middleware
const corsMiddleware = require('./middleware/cors');
const { securityHeaders, additionalSecurity } = require('./middleware/security');
const { apiLimiter, searchLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Routes
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Disable x-powered-by header
app.disable('x-powered-by');

// ===================
// Global Middleware
// ===================

// Security headers (Helmet)
app.use(securityHeaders);

// Custom security middleware
app.use(additionalSecurity);

// CORS
app.use(corsMiddleware);

// Response compression
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Parse JSON bodies (limited size)
app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/v1/articles', searchLimiter);

// ===================
// Health Check Routes
// ===================

/**
 * Basic health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check with database status
 */
app.get('/api/v1/health', async (req, res) => {
  const dbHealth = await db.healthCheck();

  const status = dbHealth.connected ? 'healthy' : 'degraded';
  const statusCode = dbHealth.connected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
    uptime: process.uptime(),
    database: dbHealth,
  });
});

// ===================
// API Routes
// ===================

// Mount API routes
app.use(`/api/${config.apiVersion}`, apiRoutes);

// API root info
app.get('/api', (req, res) => {
  res.json({
    name: 'CyberSec Dashboard API',
    version: config.apiVersion,
    endpoints: {
      articles: `/api/${config.apiVersion}/articles`,
      filters: `/api/${config.apiVersion}/filters`,
      statistics: `/api/${config.apiVersion}/statistics`,
      health: `/api/${config.apiVersion}/health`,
    },
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'CyberSec Dashboard API',
    documentation: '/api',
  });
});

// ===================
// Error Handling
// ===================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===================
// Server Startup
// ===================

async function startServer() {
  try {
    // Verify database connection
    logger.info('Verifying database connection...');
    const dbHealth = await db.healthCheck();

    if (!dbHealth.connected) {
      throw new Error(`Database connection failed: ${dbHealth.error}`);
    }

    logger.info('Database connected successfully', {
      database: dbHealth.database,
      poolSize: dbHealth.poolSize,
    });

    // Start HTTP server
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server started`, {
        port: config.port,
        environment: config.env,
        apiVersion: config.apiVersion,
      });

      logger.info(`API available at http://localhost:${config.port}/api/${config.apiVersion}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await db.close();
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason: reason?.message || reason,
      });
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
