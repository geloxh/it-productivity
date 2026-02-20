const Asset = require('../models/Asset');

exports.create = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    const assets = await Asset.find().populate('assignedTo');
    res.json(assets);
} catch (error) {
    res.status(500).json({ error: error.message });
}