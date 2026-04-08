const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getPlatformStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardMetrics);
router.get('/platform-stats', getPlatformStats);

module.exports = router;
