const User = require('../models/User');

exports.create = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const users = await User.find().populate('department');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 
exports.getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('department');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('department');
        if (!user) return res.status(404).json({ error: 'User not found.'});
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found'});
        res.json({ message: 'User deleted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};