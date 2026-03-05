const Asset = require('../models/Asset');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Overview Dashboard - All key metrics
exports.getOverview = async (req, res) => {
    try {
        const [assetStats, ticketStats, projectStats, taskStats, userStats] = await Promise.all([
            Asset.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Ticket.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Task.countDocuments(),
            User.countDocuments({ isActive: true })
        ]);

        res.json({
            assets: { total: assetStats.reduce((sum, s) => sum + s.count, 0), byStatus: assetStats },
            tickets: { total: ticketStats.reduce((sum, s) => sum + s.count, 0), byStatus: ticketStats },
            projects: { total: projectStats.reduce((sum, s) => sum + s.count, 0), byStatus: projectStats },
            tasks: { total: taskStats },
            users: { active: userStats }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Asset Dashboard
exports.getAssetMetrics = async (req, res) => {
    try {
        const [byCategory, byStatus, warrantyExpiring] = await Promise.all([
            Asset.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            Asset.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Asset.countDocuments({
                warrantyExpiry: { $gte: new Date(), $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
            })
        ]);

        res.json({ byCategory, byStatus, warrantyExpiring });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ticket Dashboard
exports.getTicketMetrics = async (req, res) => {
    try {
        const [byStatus, byPriority, avgResolutionTime] = await Promise.all([
            Ticket.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Ticket.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),
            Ticket.aggregate([
                { $match: { status: 'Closed' } },
                { $project: { resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] } } },
                { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
            ])
        ]);

        res.json({
            byStatus,
            byPriority,
            avgResolutionHours: avgResolutionTime[0]?.avgTime ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60)) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Project Dashboard
exports.getProjectMetrics = async (req, res) => {
    try {
        const [byStatus, byPriority, overdue] = await Promise.all([
            Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Project.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),
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

// Time-series data for charts (last 30 days)
exports.getTimeSeries = async (req, res) => {
    try {
        const { type } = req.query;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        let data;
        switch (type) {
            case 'tickets':
                data = await Ticket.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }},
                    { $sort: { _id: 1 } }
                ]);
                break;
            case 'assets':
                data = await Asset.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }},
                    { $sort: { _id: 1 } }
                ]);
                break;
            case 'projects':
                data = await Project.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }},
                    { $sort: { _id: 1 } }
                ]);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type. Use: tickets, assets, or projects' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};