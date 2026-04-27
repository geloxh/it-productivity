const { createSession, deleteSession } = require('../services/sessionService');
const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter')

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }

    const user = await User.create({ firstName, lastName, email, username, password, role });
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(user._id, token, expiresAt, req);

    res.cookie('token', token, COOKIE_OPTIONS);
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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(user._id, token, expiresAt, req);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ message: 'Login successful', user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) await deleteSession(token);
    res.clearCookie('token');
    res.json({ message: 'Logout successful.' }); 
  } catch (error) {
    next(error);
  }
});

module.exports = router;
