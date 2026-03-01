const express = require('express');
const router = express.Router();
const { checkPermission } = require('../../middleware/rbac');
const knowledgeBaseController = require('../../controller/knowledgeBaseController');

router.post('/', checkPermission('knowledgeBase', 'create'), knowledgeBaseController.create);
router.get('/', checkPermission('knowledgeBase', 'read'), knowledgeBaseController.getAll);
router.get('/:id', checkPermission('knowledgeBase', 'read'), knowledgeBaseController.getById);
router.put('/:id', checkPermission('knowledgeBase', 'update'), knowledgeBaseController.update);
router.delete('/:id', checkPermission('knowledgeBase', 'delete'), knowledgeBaseController.delete);

module.exports = router;
