const express = require('express');
const router = express.Router();
const { checkPermission, requireRole } = require('../../middleware/rbac');
const alertController = require('../../controller/alertController');

// Specific routes before parameterized ones to avoid Express matching conflicts
router.get('/unacknowledged', checkPermission('alerts', 'read'), alertController.getUnacknowledged);
router.get('/preferences', checkPermission('alerts', 'read'), alertController.getPreferences);
router.put('/preferences/org', requireRole('SysAdmin', 'Admin'), alertController.saveOrgDefaults);
router.put('/preferences', checkPermission('alerts', 'update'), alertController.savePreferences);
router.post('/acknowledge-all', checkPermission('alerts', 'update'), alertController.acknowledgeAll);

router.get('/', checkPermission('alerts', 'read'), alertController.getAll);
router.post('/', checkPermission('alerts', 'create'), alertController.create);
router.post('/:id/acknowledge', checkPermission('alerts', 'update'), alertController.acknowledge);
router.post('/:id/resolve', checkPermission('alerts', 'update'), alertController.resolve);

module.exports = router;
