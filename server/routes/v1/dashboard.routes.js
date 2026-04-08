const express = require('express');
const router = express.Router();    
const { getOverview, getAsssetMetrics, getTicketMetrics, getProjectMetrics, getTaskMetrics, getTimeSeries } = require('../../controller/dashboardController');

router.get('/overview', getOverview);
router.get('/assets', getAssetMertrics);
router.get('/tickets', getTicketMetrics);
router.get('/projects', getProjectMetrics);
router.get('/tasks', getTaskMetrics);
router.get('/timeseries', getTimeSeries);

module.exports = router;