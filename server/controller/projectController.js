const Project = require('../models/Project');
const Task = require('../models/Task');

exports.create = async (req, res) => {
    try {
        const project = await Project.create({ ...req.body, owner: req.user.id });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const projects = await Project.find().populate('owner members');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner members');
        if (!project) return res.status(404).json({ error: 'Project not found.'});
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /projects/stats
// Returns all projects with task counts and overdue info in one query
exports.getStats = async (req, res) => {
    try {
        const projects = await Project.find().populate('owner members').lean();

        // Aggregate task counts grouped by project + status
        const taskAgg = await Task.aggregate([
            {
                $group: {
                    _id: { project: '$project', status: '$status' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Aggregate overdue tasks per project (not Done, past dueDate)
        const now = new Date();
        const overdueAgg = await Task.aggregate([
            {
                $match: {
                    status: { $ne: 'Done' },
                    dueDate: { $lt: now }
                }
            },
            {
                $group: {
                    _id: '$project',
                    overdueCount: { $sum: 1 }
                }
            }
        ]);

        // Build lookup maps
        const taskMap = {};
        for (const row of taskAgg) {
            const pid = row._id.project?.toString();
            if (!pid) continue;
            if (!taskMap[pid]) taskMap[pid] = { total: 0, done: 0 };
            taskMap[pid].total += row.count;
            if (row._id.status === 'Done') taskMap[pid].done += row.count;
        }

        const overdueMap = {};
        for (const row of overdueAgg) {
            if (row._id) overdueMap[row._id.toString()] = row.overdueCount;
        }

        const result = projects.map(p => {
            const pid = p._id.toString();
            const tasks = taskMap[pid] ?? { total: 0, done: 0 };
            const isOverdue = p.endDate && p.status !== 'Completed' && p.status !== 'Cancelled'
                && new Date(p.endDate) < now;
            return {
                ...p,
                taskTotal: tasks.total,
                taskDone: tasks.done,
                overdueTaskCount: overdueMap[pid] ?? 0,
                isOverdue,
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ error: 'Project not found.' });
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found." });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
