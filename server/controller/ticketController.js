const Ticket = require('../models/Ticket');

exports.create = async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('requester assignedTo relatedAsset');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('requester assignedTo relatedAsset');
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.'});
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.'});
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
        res.json({ message: 'Ticket deleted.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};