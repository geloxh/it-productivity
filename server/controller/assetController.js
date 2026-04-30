const Asset = require('../models/Asset');

exports.create = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.bulkCreate = async (req, res) => {
    try {
        const assets = await Asset.insertMany(req.body, { ordered: false })
        res.status(201).json({ inserted: assets.length })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.getAll = async (req, res) => {
    try {
        const assets = await Asset.find()
            .populate('assignedTo.entityId', 'firstName lastName employeeId department')
            .populate('assignmentHistory.user', 'firstName lastName employeeId');  
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('assignedTo.entityId', 'firstName lastName employeeId department')
            .populate('assignmentHistory.user');
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!asset) return res.status(404).json({ error: 'Asset not found.' });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);
        if (!asset) return res.status(404).json({ error: 'Asset not found.' });
        res.json({ message: 'Asset deleted. '});
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

exports.assign = async (req, res) => {
    try {
        const { entityId, ref } = req.body;
        const asset = await Asset.findById(req.params.id);

        if (!asset) return res.status(404).json({ error: 'Asset not found.' });

        if (asset.assignedTo?.entityId) {
            asset.assignmentHistory.push({
                user: asset.assignedTo.entityId,
                userModel: asset.assignedTo.ref,
                assignedAt: asset.assignedAt,
                returnedAt: Date.now()
            });
        }

        asset.assignedTo = { entityId, ref };
        asset.assignedAt = Date.now();
        asset.status = 'Assigned';
        await asset.save();
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}