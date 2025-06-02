const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Register the /metrics endpoint
router.get('/metrics', metricsController.getMetrics);

module.exports = router;