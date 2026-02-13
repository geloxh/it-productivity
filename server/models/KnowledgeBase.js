const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['Hardware', 'Software', 'Network', 'Security', 'General'], required: true },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    relatedTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    createdAt: { type: Date, default: Date.now },
    updatedAT: { type: Date, default: Date.now }
});

knowledgeBaseSchema.pre('save', function(next) {
    this.updateAt = Date.now();
    next();
});

modules.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);