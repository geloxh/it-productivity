const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { updateUserSchema } = require('../../validators/user.validator');
const userController = require('../../controller/userController');

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.delete);

module.exports = router;