const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { createSession } = require('./sessionService');

const register = async (userData, req) => {
    const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
    });
    if (existingUser) {
        const field = existingUser.email === userData.email ? 'Email' : 'Username';
        throw new Error(`${field} already registered.`);
    }

    const user = await User.create(userData);
    const token = generateToken({ id: user._id, role: user.role });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(user._id, token, expiresAt, req);

    return { user: { id: user._id, email: user.email, username: user.username, role: user.role }, token };
};

const login = async (identifier, password, req) => {
    const user = await User.findOne({ 
        $or: [{ email: identifier }, { username: identifier }]

    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(user._id, token, expiresAt, req);

    return { user: { id: user._id, email: user.email, username: user.username, role: user.role }, token };
};

module.exports = { register, login };