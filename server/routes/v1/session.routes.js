const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const sessionController = require('../../controller/sessionController');

router.get('/', authenticate, sessionController.getActiveSessions);
router.post('/logout-all', autheticate, sessionController.logoutAllDevices);
router.post('/logout-others', authenticate, sessionController.logoutOtherDevices);

module.exports = router;