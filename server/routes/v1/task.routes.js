const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../../validators/task.validator');
const taskController = require('../../controller/taskController');

router.post('/', validate(createTaskSchema), taskController.create);
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;
