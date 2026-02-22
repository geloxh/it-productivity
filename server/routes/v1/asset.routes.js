const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { createAssetSchema, updateAssetSchema } = require('../../validators/asset.validator');
const assetController = require('../../controller/assetController');

router.post('/', validate(createAssetSchema), assetController.create);
router.get('/', assetController.getAll);
router.get('/:id', assetController.getById);
router.put('/:id', validate(updateAssetSchema), assetController.update);
router.delete('/:id', assetController.delete);

module.exports = router;
