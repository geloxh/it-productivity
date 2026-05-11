const Task = require('../models/Task');

exports.create = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        const populated = await Task.findById(task._id).populate('project assignedTo relatedTicket relatedAsset');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /tasks — all tasks, optional ?assignedTo=<userId>
exports.getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
        const tasks = await Task.find(filter).populate('project assignedTo relatedTicket relatedAsset');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /tasks/mine — tasks assigned to the current user
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id })
            .populate('project assignedTo relatedTicket relatedAsset');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project assignedTo relatedTicket relatedAsset');
        if (!task) return res.status(404).json({ error: 'Task not found.' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('project assignedTo relatedTicket relatedAsset');
        if (!task) return res.status(404).json({ error: 'Task not found.' });
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

// GET /tasks/workload — open task count per assignee
exports.getWorkload = async (req, res) => {
    try {
        const rows = await Task.aggregate([
            { $match: { status: { $ne: 'Done' }, assignedTo: { $exists: true, $ne: null } } },
            { $group: { _id: '$assignedTo', openTasks: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmpty: false } },
            { $project: { _id: 1, openTasks: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.email': 1 } },
            { $sort: { openTasks: -1 } }
        ]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
