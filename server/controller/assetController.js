const Asset = require('../models/Asset');

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