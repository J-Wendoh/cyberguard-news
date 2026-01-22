/**
 * Article Service
 * Business logic for fetching and processing security articles
 *
 * Tables: security_articles, security_newsletters
 */

const db = require('../config/database');
const { sanitizeArticle } = require('../utils/sanitizer');
const config = require('../config');
const logger = require('../utils/logger');

// Table name constant
const ARTICLES_TABLE = 'security_articles';
const NEWSLETTERS_TABLE = 'security_newsletters';

/**
 * Get articles with filtering, sorting, and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Articles with metadata
 */
async function getArticles(options = {}) {
  const {
    page = 1,
    limit = config.pagination.defaultLimit,
    priority = null,
    category = null,
    source = null,
    search = null,
    startDate = null,
    endDate = null,
    sortBy = 'id',
    sortOrder = 'DESC',
  } = options;

  // Validate and cap limit
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || config.pagination.defaultLimit), config.pagination.maxLimit);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  // Build dynamic query
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Priority filter (High, Medium, Low)
  if (priority) {
    conditions.push(`priority = $${paramIndex}`);
    params.push(priority);
    paramIndex++;
  }

  // Category filter
  if (category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  // Source filter
  if (source) {
    conditions.push(`source = $${paramIndex}`);
    params.push(source);
    paramIndex++;
  }

  // Date range filters (using created_at or published_date if available)
  if (startDate) {
    conditions.push(`created_at >= $${paramIndex}`);
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    conditions.push(`created_at <= $${paramIndex}`);
    params.push(endDate);
    paramIndex++;
  }

  // Full-text search
  if (search) {
    conditions.push(`(
      title ILIKE $${paramIndex} OR
      COALESCE(description, '') ILIKE $${paramIndex} OR
      COALESCE(source, '') ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Validate sort column (prevent SQL injection)
  const allowedSortColumns = ['id', 'created_at', 'title', 'priority', 'category', 'source', 'published_date'];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total matching records
  const countQuery = `SELECT COUNT(*) as total FROM ${ARTICLES_TABLE} ${whereClause}`;
  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  // Fetch articles with pagination - select all available columns
  const articlesQuery = `
    SELECT *
    FROM ${ARTICLES_TABLE}
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(safeLimit, offset);

  const result = await db.query(articlesQuery, params);

  // Sanitize all articles
  const articles = result.rows.map(sanitizeArticle);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: articles,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Get a single article by ID
 * @param {string|number} id - Article ID
 * @returns {Promise<Object|null>} Article or null
 */
async function getArticleById(id) {
  const query = `SELECT * FROM ${ARTICLES_TABLE} WHERE id = $1`;
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return sanitizeArticle(result.rows[0]);
}

/**
 * Get distinct priorities for filtering
 * @returns {Promise<Array>} List of priorities
 */
async function getPriorities() {
  const query = `
    SELECT DISTINCT priority, COUNT(*) as count
    FROM ${ARTICLES_TABLE}
    WHERE priority IS NOT NULL AND priority != ''
    GROUP BY priority
    ORDER BY
      CASE priority
        WHEN 'High' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Low' THEN 3
        ELSE 4
      END
  `;

  const result = await db.query(query);
  return result.rows;
}

/**
 * Get distinct categories for filtering
 * @returns {Promise<Array>} List of categories
 */
async function getCategories() {
  const query = `
    SELECT DISTINCT category, COUNT(*) as count
    FROM ${ARTICLES_TABLE}
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `;

  const result = await db.query(query);
  return result.rows;
}

/**
 * Get distinct sources for filtering
 * @returns {Promise<Array>} List of sources
 */
async function getSources() {
  const query = `
    SELECT DISTINCT source, COUNT(*) as count
    FROM ${ARTICLES_TABLE}
    WHERE source IS NOT NULL AND source != ''
    GROUP BY source
    ORDER BY count DESC
  `;

  const result = await db.query(query);
  return result.rows;
}

/**
 * Get latest articles (shorthand for common use case)
 * @param {number} count - Number of articles
 * @returns {Promise<Array>} Latest articles
 */
async function getLatestArticles(count = 10) {
  const result = await getArticles({
    limit: count,
    sortBy: 'id',
    sortOrder: 'DESC',
  });

  return result.data;
}

/**
 * Get article statistics
 * @returns {Promise<Object>} Statistics
 */
async function getStatistics() {
  const query = `
    SELECT
      COUNT(*) as total_articles,
      COUNT(DISTINCT category) as total_categories,
      COUNT(DISTINCT source) as total_sources,
      COUNT(DISTINCT priority) as total_priorities,
      COUNT(*) FILTER (WHERE priority = 'High') as high_priority_count,
      COUNT(*) FILTER (WHERE priority = 'Medium') as medium_priority_count,
      COUNT(*) FILTER (WHERE priority = 'Low') as low_priority_count,
      MIN(created_at) as oldest_article,
      MAX(created_at) as newest_article
    FROM ${ARTICLES_TABLE}
  `;

  const result = await db.query(query);
  return result.rows[0];
}

/**
 * Get newsletters with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Newsletters with metadata
 */
async function getNewsletters(options = {}) {
  const {
    page = 1,
    limit = config.pagination.defaultLimit,
    sortBy = 'timestamp',
    sortOrder = 'DESC',
  } = options;

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || config.pagination.defaultLimit), config.pagination.maxLimit);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const allowedSortColumns = ['id', 'timestamp', 'date', 'total_items'];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'timestamp';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countResult = await db.query(`SELECT COUNT(*) as total FROM ${NEWSLETTERS_TABLE}`);
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    SELECT *
    FROM ${NEWSLETTERS_TABLE}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT $1 OFFSET $2
  `;

  const result = await db.query(query, [safeLimit, offset]);
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: result.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Get table schema information (for debugging)
 * @returns {Promise<Object>} Schema info
 */
async function getSchema() {
  const articlesSchema = await db.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [ARTICLES_TABLE]);

  const newslettersSchema = await db.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [NEWSLETTERS_TABLE]);

  return {
    security_articles: articlesSchema.rows,
    security_newsletters: newslettersSchema.rows,
  };
}

module.exports = {
  getArticles,
  getArticleById,
  getPriorities,
  getCategories,
  getSources,
  getLatestArticles,
  getStatistics,
  getNewsletters,
  getSchema,
};
