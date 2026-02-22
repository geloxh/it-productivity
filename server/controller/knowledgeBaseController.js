const KnowledgeBase = require('../models/KnowledgeBase');

exports.create = async (req, res) => {
    try {
        const kb = await KnowledgeBase.create(req.body);
        res.status(201).json(kb);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getAll = async (req, res) => {
    try {
        const kbs = await KnowledgeBase.find().populate('author relatedTickets');
        res.json(kbs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const kb = await KnowledgeBase.findById(req.params.id).populate('author relatedTickets');
        if (!kb) return res.status(404).json({ error: 'Knowledge base not found.' });
        res.json(kb);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const kb = await KnowledgeBase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!kb) return res.status(404).json({ error: 'Knowledge base not found' });
        res.json(kb);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const kb = await KnowledgeBase.findByIdAndDelete(req.params.id);
        if (!kb) return res.status(404).json({ error: 'Knosledge base not found.' });
        res.json({ message: 'Knowledge base deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};