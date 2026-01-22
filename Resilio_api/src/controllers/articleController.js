/**
 * Article Controller
 * HTTP request handlers for article endpoints
 */

const articleService = require('../services/articleService');
const logger = require('../utils/logger');

/**
 * GET /api/v1/articles
 * Fetch articles with optional filters
 */
async function getArticles(req, res, next) {
  try {
    const {
      page,
      limit,
      priority,
      category,
      source,
      search,
      start_date: startDate,
      end_date: endDate,
      sort_by: sortBy,
      sort_order: sortOrder,
    } = req.query;

    const result = await articleService.getArticles({
      page,
      limit,
      priority,
      category,
      source,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/articles/:id
 * Fetch a single article by ID
 */
async function getArticleById(req, res, next) {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Article ID must be a valid number',
        },
      });
    }

    const article = await articleService.getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Article not found',
        },
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/articles/latest
 * Fetch the most recent articles
 */
async function getLatestArticles(req, res, next) {
  try {
    const count = Math.min(parseInt(req.query.count, 10) || 10, 50);
    const articles = await articleService.getLatestArticles(count);

    res.json({
      success: true,
      data: articles,
      count: articles.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/filters/priorities
 * Get all available priorities for filtering
 */
async function getPriorities(req, res, next) {
  try {
    const priorities = await articleService.getPriorities();

    res.json({
      success: true,
      data: priorities,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/filters/categories
 * Get all available categories for filtering
 */
async function getCategories(req, res, next) {
  try {
    const categories = await articleService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/filters/sources
 * Get all available sources for filtering
 */
async function getSources(req, res, next) {
  try {
    const sources = await articleService.getSources();

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/statistics
 * Get article statistics
 */
async function getStatistics(req, res, next) {
  try {
    const stats = await articleService.getStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/newsletters
 * Fetch newsletters with pagination
 */
async function getNewsletters(req, res, next) {
  try {
    const {
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
    } = req.query;

    const result = await articleService.getNewsletters({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/schema
 * Get database schema (for debugging)
 */
async function getSchema(req, res, next) {
  try {
    const schema = await articleService.getSchema();

    res.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getArticles,
  getArticleById,
  getLatestArticles,
  getPriorities,
  getCategories,
  getSources,
  getStatistics,
  getNewsletters,
  getSchema,
};
