const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validators/user.validator');
const User = require('../../models/User');
const { generateToken } = require('../../utils/jwt');

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create(req.body);
    const token = generateToken({ id: user._id, role: user.role });
    
    res.status(201).json({ user: { id: user._id, email: user.email }, token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
