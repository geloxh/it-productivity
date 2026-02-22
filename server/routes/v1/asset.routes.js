const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validators/user.validator');

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }

    const user = await User.create({ firstName, lastName, email, password, role });
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: 'Login successful', user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

modules.exports = router;

