const { register, login } = require('../services/authService');
const { deleteSession } = require('../services/sessionService');

exports.register = async (req, res, next) => {
    try {
        const { user, token } = await register(req.body, req);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        next (error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await login(email, password, req);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) await deleteSession(token);
        res.clearCookie('token');
        res.json({ message: 'Logout successful.' });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).select('-password');
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;