const express = require('express');
const router = express.Router();    
const { getOverview, getAssetMetrics, getTicketMetrics, getProjectMetrics, getTaskMetrics, getTimeSeries, getWidgets } = require('../../controller/dashboardController');

router.get('/overview', getOverview);
router.get('/assets', getAssetMetrics);
router.get('/tickets', getTicketMetrics);
router.get('/projects', getProjectMetrics);
router.get('/tasks', getTaskMetrics);
router.get('/timeseries', getTimeSeries);
router.get('/widgets', getWidgets);

module.exports = router;