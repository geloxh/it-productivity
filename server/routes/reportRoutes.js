const express = require('express');
const router = express.Router();
const report = require('../controller/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/assets', report.getAssetReport);
router.get('/tickets', report.getTicketReport);
router.get('/projects', report.getProjectReport);
router.get('/tasks', report.getTaskReport);
router.get('/historical', report.getHistoricalAnalysis);

module.exports = router;