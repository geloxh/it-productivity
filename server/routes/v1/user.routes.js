const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { checkPermission } = require('../../middleware/rbac');
const { updateUserSchema } = require('../../validators/user.validator');
const userController = require('../../controller/userController');

router.get('/', checkPermission('users', 'read'), userController.getAll);
router.get('/:id', checkPermission('users', 'read'), userController.getById);
router.put('/:id', checkPermission('users', 'update'), validate(updateUserSchema), userController.update);
router.delete('/:id', checkPermission('users', 'delete'), userController.delete);

module.exports = router;
