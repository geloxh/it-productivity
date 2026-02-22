const Ticket = require('../models/Ticket');

const createTicket = async (ticketData) => {
    return await Ticket.create(ticketData);
};

const getAllTickets = async (filters = {}) => {
    return await Ticket.find(filters).populate('requester assignedTo relatedAsset');
};

const getTicketById = async (id) => {
    const ticket = await Ticket.findById(id).populate('requester assignedTo relatedAsset');
    if (!ticket) throw new Error('Ticket not found.');
    return ticket;
};

const updateTicket = async (id, updates) => {
    const ticket = await Ticket.findByIdAndUpdate(id, updates, {new: true, runValidators: true });
    if (!ticket) throw new Error('Ticket not found.');
    return ticket;
};

const addComment = async (id, comment) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new Error('Ticket not found.');
    ticket.comments.push(comment);
    await ticket.save();
    return ticket;
};

module.exports = { createTicket, getAllTickets, getTicketById, updateTicket, addComment };