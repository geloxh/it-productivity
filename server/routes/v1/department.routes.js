const express = require('express');
const router = express.Router();
const { checkPermission } = require('../../middleware/rbac');
const departmentController = require('../../controller/departmentController');

router.post('/', checkPermission('departments', 'create'), departmentController.create);
router.get('/', checkPermission('departments', 'read'), departmentController.getAll);
router.get('/:id', checkPermission('departments', 'read'), departmentController.getById);
router.put('/:id', checkPermission('departments', 'update'), departmentController.update);
router.delete('/:id', checkPermission('departments', 'delete'), departmentController.delete);

module.exports = router;
