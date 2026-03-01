const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { checkPermission } = require('../../middleware/rbac');
const { createAssetSchema, updateAssetSchema } = require('../../validators/asset.validator');
const assetController = require('../../controller/assetController');

router.post('/', checkPermission('assets', 'create'), validate(createAssetSchema), assetController.create);
router.get('/', checkPermission('assets', 'read'), assetController.getAll);
router.get('/:id', checkPermission('assets', 'read'), assetController.getById);
router.put('/:id', checkPermission('assets', 'update'), validate(updateAssetSchema), assetController.update);
router.delete('/:id', checkPermission('assets', 'delete'), assetController.delete);

module.exports = router;
