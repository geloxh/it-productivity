const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validators/user.validator');
const { authenticate } = require('../../middleware/auth');
const { register, login, logout, getProfile } = require('../../controller/authController');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getProfile);

module.exports = router;