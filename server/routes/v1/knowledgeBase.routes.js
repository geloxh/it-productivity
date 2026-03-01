const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../../controller/knowledgeBaseController');

router.post('/', knowledgeBaseController.create);
router.get('/', knowledgeBaseController.getAll);
router.get('/:id', knowledgeBaseController.getById);
router.put('/:id', knowledgeBaseController.update);
router.delete('/:id', knowledgeBaseController.delete);

module.exports = router;