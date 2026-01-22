/**
 * Article Routes
 * Defines all article-related API endpoints
 */

const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

/**
 * @route   GET /api/v1/articles
 * @desc    Get all articles with pagination and filtering
 * @query   page, limit, region, category, source, search, start_date, end_date, sort_by, sort_order
 * @access  Public
 */
router.get('/', articleController.getArticles);

/**
 * @route   GET /api/v1/articles/latest
 * @desc    Get the most recent articles
 * @query   count (default: 10, max: 50)
 * @access  Public
 */
router.get('/latest', articleController.getLatestArticles);

/**
 * @route   GET /api/v1/articles/:id
 * @desc    Get a single article by ID
 * @param   id - Article ID
 * @access  Public
 */
router.get('/:id', articleController.getArticleById);

module.exports = router;
