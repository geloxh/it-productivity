const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    status: { type: String, enum: ['Open', 'In-Progress', 'Resolved', 'Closed'], default: 'Open' },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String },
    guestEmail: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);