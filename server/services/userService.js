const User = require('../models/User');

const getAllUsers = async (filters = {}) => {
    return await User.find(filters).select('-password').populate('department');
};

const getUserById = async (id) => {
    const user = await User.findById(id).select('-password').populate('department');
    if (!user) throw new Error('User not found.');
};

const updateUser = async (id) => {
    const user = await User.findByIdAndUpdate(id);
    if (!user) throw new Error('User not found.');
    return user;
};

const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error('User not found.');
    return user;
};

modules.exports = { getAllUsers, getUserById, updateUser, deleteUser };