/**
 * Database Connection Pool
 * Manages PostgreSQL connections with automatic pooling
 */

const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

// Create connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,

  // Pool settings
  min: config.db.pool.min,
  max: config.db.pool.max,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,

  // Prevent leaks
  allowExitOnIdle: false,
});

// Pool event handlers
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Execute a query with automatic connection management
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Query executed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    logger.error('Query failed', {
      query: text.substring(0, 100),
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Pool client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Timeout to detect connection leaks
  const timeout = setTimeout(() => {
    logger.warn('Client has been checked out for more than 5 seconds');
  }, 5000);

  client.query = (...args) => {
    return originalQuery(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };

  return client;
}

/**
 * Check database connectivity
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const result = await query('SELECT NOW() as time, current_database() as database');
    return {
      connected: true,
      timestamp: result.rows[0].time,
      database: result.rows[0].database,
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Gracefully close all connections
 */
async function close() {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed');
}

module.exports = {
  query,
  getClient,
  healthCheck,
  close,
  pool,
};
