const Department = require('../models/Department');

exports.create = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

exports.getAll = async (req, res) => {
    try {
        const departments = await Department.find().populate('manager');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id).populate('manager');
        if (!department) return res.status(404).json({ error: 'Department not found.' });
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ error: 'Department not found.' });
        res.json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}