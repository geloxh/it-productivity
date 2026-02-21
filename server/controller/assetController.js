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
    try {
        const assets = await Asset.find().populate('assignedTo');
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id).populate('assignedTo');
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const asset= await Asset.findByIdAndDelete(req.params.id);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json({ message: 'Asset deleted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

