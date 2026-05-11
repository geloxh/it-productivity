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
        const task = await Task.findById(req.params.id).populate('project assignedTo');
        if (!task) return  res.status(404).json({ error: 'Task not found.' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

exports.remove = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /tasks/workload
// Returns open task count per assignee across all projects
exports.getWorkload = async (req, res) => {
    try {
        const rows = await Task.aggregate([
            { $match: { status: { $ne: 'Done' }, assignedTo: { $exists: true, $ne: null } } },
            { $group: { _id: '$assignedTo', openTasks: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmpty: false } },
            { $project: {
                _id: 1,
                openTasks: 1,
                'user.firstName': 1,
                'user.lastName': 1,
                'user.email': 1,
            }},
            { $sort: { openTasks: -1 } }
        ]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};