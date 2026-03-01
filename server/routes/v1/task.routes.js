const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { checkPermission } = require('../../middleware/rbac');
const { createTaskSchema, updateTaskSchema } = require('../../validators/task.validator');
const taskController = require('../../controller/taskController');

router.post('/', checkPermission('tasks', 'create'), validate(createTaskSchema), taskController.create);
router.get('/', checkPermission('tasks', 'read'), taskController.getAll);
router.get('/:id', checkPermission('tasks', 'read'), taskController.getById);
router.put('/:id', checkPermission('tasks', 'update'), validate(updateTaskSchema), taskController.update);
router.delete('/:id', checkPermission('tasks', 'delete'), taskController.delete);

module.exports = router;
