/**
 * Filter Routes
 * Endpoints for getting available filter options
 */

const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

/**
 * @route   GET /api/v1/filters/priorities
 * @desc    Get all available priorities with article counts (High, Medium, Low)
 * @access  Public
 */
router.get('/priorities', articleController.getPriorities);

/**
 * @route   GET /api/v1/filters/categories
 * @desc    Get all available categories with article counts
 * @access  Public
 */
router.get('/categories', articleController.getCategories);

/**
 * @route   GET /api/v1/filters/sources
 * @desc    Get all available news sources with article counts
 * @access  Public
 */
router.get('/sources', articleController.getSources);

module.exports = router;
