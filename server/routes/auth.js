const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock user store (replace with database)
const users = [];

router.post('/register', async (req, res, next) => {
    try {
        const { emai, password } req.body;

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: { message: 'User already exists' } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { id: Date.now(), email, password: hashedPassword };
        users.push(user);

        const token = generateToken({ id: user.id, email: user.email });

        res.cookie('token', token, {
            httpOnly: true;
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: { message: 'Invalid credentials'} });
        }

        const token = generateToken({ id: user.id, email: user.email });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});

router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;