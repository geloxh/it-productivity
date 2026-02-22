const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { createProjectSchema, updateProjectSchema } = require('../../validators/project.validator');
const projectController = require('../../controller/projectController');

router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.getAll);
router.put('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

module.exports = router;
