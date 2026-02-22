const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUSer) throw new Error('Email already registered');

    const user = await User.create(userData);
    const token = generateToken({ id: user._id, role: user.role });

    return { user: { id: user._id, email: user.email, role: user.role }, token };
};