const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { checkPermission } = require('../../middleware/rbac');
const { createProjectSchema, updateProjectSchema } = require('../../validators/project.validator');
const projectController = require('../../controller/projectController');

router.post('/', checkPermission('projects', 'create'), validate(createProjectSchema), projectController.create);
router.get('/', checkPermission('projects', 'read'), projectController.getAll);
router.put('/:id', checkPermission('projects', 'update'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', checkPermission('projects', 'delete'), projectController.delete);

module.exports = router;
