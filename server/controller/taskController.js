const Task = require('../models/Task');

exports.create = async (req, res) => { 
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const tasks = await Task.find().populate('project assignedTo');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('projectAssignedto');
        if (!task) return  res.status(404).json({ error: 'Task not found.' });
        res.json(task);
    } catch (error) {
        res.json(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found.'});
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};