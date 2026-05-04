const ticketService = require('../services/ticketService');
const Ticket = require('../models/Ticket');

exports.create = async (req, res) => {
    try {
        const ticket = await ticketService.createTicket({ ...req.body, requester: req.user.id });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.publicCreate = async (req, res) => {
    try {
        const { title, description, priority, guestName, guestEmail } = req.body;
        const ticket = await ticketService.createTicket({ title, description, priority, category, guestName, guestEmail });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        res.json(ticket);
    } catch (error) {
        res.status(error.message === 'Ticket not found.' ? 404 : 500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const ticket = await ticketService.updateTicket(req.params.id, req.body);
        res.json(ticket);
    } catch (error) {
        res.status(error.message === 'Ticket not found.' ? 404 : 400).json({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const ticket = await ticketService.addComment(req.params.id, { user: req.user.id, text: req.body.text });
        res.json(ticket);
    } catch (error) {
        res.status(error.message === 'Ticket not found.' ? 404 : 400).json({ 
            error: error.message
        });
    }
}

exports.bulkUpdate = async (req, res) => {
    try {
        const { ids, update } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No ids provided.' });
        await Ticket.updateMany({ _id: { $in: ids } }, update);
        res.json({ updated: ids.length });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No ids provided.' });
        await Ticket.deleteMany({ _id: { $in: ids } });
        res.json({ deleted: ids.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
        res.json({ message: 'Ticket deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};