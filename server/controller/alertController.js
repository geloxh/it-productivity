const Alert = require('../models/Alert');
const NotificationPreference = require('../models/NotificationPreference');

// GET /alerts
exports.getAll = async (req, res) => {
    try {
        const { severity, category, asset, resolved, from, to, search } = req.query;
        const filter = {};

        if (severity) filter.severity = severity;
        if (category) filter.category = category;
        if (asset) filter.asset = asset;
        if (resolved !== undefined) filter.isResolved = resolved === 'true';
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { assetName: { $regex: search, $options: 'i' } }
            ];
        }

        const alerts = await Alert.find(filter)
            .populate('asset', 'name assetTag')
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /alerts/unacknowledged
exports.getUnacknowledged = async (req, res) => {
    try {
        const userId = req.user.id;

        const alerts = await Alert.find({
            isResolved: false,
            'acknowledgedBy.user': { $ne: userId }
        }).sort({ createdAt: -1 });

        const grouped = {
            P1: [],
            P2: [],
            P3count: 0,
            P4count: 0
        };

        for (const alert of alerts) {
            if (alert.severity === 'P1') grouped.P1.push(alert);
            else if (alert.severity === 'P2') grouped.P2.push(alert);
            else if (alert.severity === 'P3') grouped.P3count++;
            else if (alert.severity === 'P4') grouped.P4count++;
        }

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /alerts
exports.create = async (req, res) => {
    try {
        const { groupKey } = req.body;

        if (groupKey) {
            const existing = await Alert.findOne({ groupKey, isResolved: false });
            if (existing) {
                existing.count += 1;
                if (req.body.title) existing.title = req.body.title;
                if (req.body.message) existing.message = req.body.message;
                await existing.save();
                return res.json(existing);
            }
        }

        const alert = await Alert.create(req.body);
        res.status(201).json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// POST /alerts/:id/acknowledge
exports.acknowledge = async (req, res) => {
    try {
        const userId = req.user.id;
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ error: 'Alert not found.' });

        const alreadyAcked = alert.acknowledgedBy.some(
            (entry) => entry.user.toString() === userId.toString()
        );

        if (!alreadyAcked) {
            alert.acknowledgedBy.push({ user: userId, acknowledgedAt: new Date() });
            await alert.save();
        }

        res.json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// POST /alerts/acknowledge-all
exports.acknowledgeAll = async (req, res) => {
    try {
        const userId = req.user.id;

        const alerts = await Alert.find({
            isResolved: false,
            severity: { $in: ['P1', 'P2'] },
            'acknowledgedBy.user': { $ne: userId }
        });

        const now = new Date();
        await Promise.all(alerts.map(alert => {
            alert.acknowledgedBy.push({ user: userId, acknowledgedAt: now });
            return alert.save();
        }));

        res.json({ acknowledged: alerts.length });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// POST /alerts/:id/resolve
exports.resolve = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { isResolved: true, resolvedAt: new Date() },
            { new: true }
        );
        if (!alert) return res.status(404).json({ error: 'Alert not found.' });
        res.json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET /alerts/preferences
exports.getPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const userPrefs = await NotificationPreference.findOne({ user: userId });
        const orgDefaults = await NotificationPreference.findOne({ orgDefaults: true });

        if (!userPrefs) {
            return res.json({
                preferences: {
                    preferences: [
                        { alertCategory: 'All', severity: 'All', inApp: true, email: false }
                    ]
                },
                orgDefaults: orgDefaults || null
            });
        }

        res.json({ preferences: userPrefs, orgDefaults: orgDefaults || null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /alerts/preferences
exports.savePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        const updated = await NotificationPreference.findOneAndUpdate(
            { user: userId },
            { user: userId, preferences },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// PUT /alerts/preferences/org
exports.saveOrgDefaults = async (req, res) => {
    try {
        const { preferences } = req.body;

        const updated = await NotificationPreference.findOneAndUpdate(
            { orgDefaults: true },
            { orgDefaults: true, preferences },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
