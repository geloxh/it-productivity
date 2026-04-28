const Asset = require('../models/Asset');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Overview Dashboard - All key metrics
exports.getOverview = async (req, res) => {
    try {
        const [assetStats, ticketStats, projectStats, taskStats, userStats] = await Promise.all([
            Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Task.countDocuments(),
            User.countDocuments({ isActive: true })
        ]);

        res.json({
            assets:   { total: assetStats.reduce((s, i) => s + i.count, 0),   byStatus: assetStats },
            tickets:  { total: ticketStats.reduce((s, i) => s + i.count, 0),  byStatus: ticketStats },
            projects: { total: projectStats.reduce((s, i) => s + i.count, 0), byStatus: projectStats },
            tasks:    { total: taskStats },
            users:    { active: userStats }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWidgets = async (req, res) => {
    try {
        const KnowledgeBase = require('../models/KnowledgeBase')
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const [recentTickets, overdueTasksRaw, aging3, aging7, announcements] = await Promise.all([
            Ticket.find({ status: { $in: ['Open', 'In-Progress'] } })
                .sort({ createdAt: -1 }).limit(5)
                .select('title priority status createdAt'),
            Task.find({ dueDate: { $lt: new Date() }, status: { $nin: ['Done'] } })
                .populate('assignedTo', 'firstName lastName')
                .select('title dueDate assignedTo priority'),
            Ticket.countDocuments({ status: { $in: ['Open', 'In-Progress'] }, createdAt: { $lt: threeDaysAgo } }),
            Ticket.countDocuments({ status: { $in: ['Open', 'In-Progress'] }, createdAt: { $lt: sevenDaysAgo } }),
            KnowledgeBase.find({ isPublished: true }).sort({ createdAt: -1 }).limit(5).select('title category createdAt'),
        ])

        const overdueByAssignee = overdueTasksRaw.reduce((acc, t) => {
            const key = t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'
            if (!acc[key]) acc[key] = []
            acc[key].push({ title: t.title, dueDate: t.dueDate, priority: t.priority })
            return acc
        }, {})

        res.json({ recentTickets, overdueByAssignee, aging: { gt3: aging3, gt7: aging7 }, announcements })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Asset KPIs
exports.getAssetMetrics = async (req, res) => {
    try {
        const ninetyDaysOut = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

        const [byCategory, byStatus, warrantyExpiring] = await Promise.all([
            Asset.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
            Asset.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
            Asset.countDocuments({ warrantyExpiry: { $gte: new Date(), $lte: ninetyDaysOut } })
        ]);

        res.json({ byCategory, byStatus, warrantyExpiring });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ticket KPIs
exports.getTicketMetrics = async (req, res) => {
    try {
        const [byStatus, byPriority, avgResolutionTime, openUnassigned] = await Promise.all([
            Ticket.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
            Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Ticket.aggregate([
                { $match: { status: 'Closed' } },
                { $project: { resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] } } },
                { $group: { _id: null, avgMs: { $avg: '$resolutionTime' } } }
            ]),
            Ticket.countDocuments({ status: 'Open', assignedTo: { $exists: false } })
        ]);

        res.json({
            byStatus,
            byPriority,
            avgResolutionHours: avgResolutionTime[0]?.avgMs
                ? Math.round(avgResolutionTime[0].avgMs / 3_600_000)
                : 0,
            openUnassigned
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Project KPIs
exports.getProjectMetrics = async (req, res) => {
    try {
        const [byStatus, byPriority, overdue] = await Promise.all([
            Project.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
            Project.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Project.countDocuments({
                endDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
            })
        ]);

        res.json({ byStatus, byPriority, overdue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Task KPIs (no status field on Task model — uses priority + dueDate)
exports.getTaskMetrics = async (req, res) => {
    try {
        const [byPriority, overdue, unassigned] = await Promise.all([
            Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Task.countDocuments({ dueDate: { $lt: new Date() } }),
            Task.countDocuments({ assignedTo: { $exists: false } })
        ]);

        res.json({ byPriority, overdue, unassigned });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Time-series (last 30 days) — ?type=tickets|assets|projects|tasks
exports.getTimeSeries = async (req, res) => {
    try {
        const { type } = req.query;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const modelMap = { tickets: Ticket, assets: Asset, projects: Project, tasks: Task };
        const Model = modelMap[type];

        if (!Model) return res.status(400).json({ error: 'Invalid type. Use: tickets, assets, projects, or tasks' });

        const data = await Model.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};