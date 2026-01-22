/**
 * Route Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

const articleRoutes = require('./articles');
const filterRoutes = require('./filters');
const articleController = require('../controllers/articleController');

// Mount route modules
router.use('/articles', articleRoutes);
router.use('/filters', filterRoutes);

// Statistics endpoint
router.get('/statistics', articleController.getStatistics);

// Newsletters endpoint
router.get('/newsletters', articleController.getNewsletters);

// Schema endpoint (for debugging - shows table structure)
router.get('/schema', articleController.getSchema);

module.exports = router;
