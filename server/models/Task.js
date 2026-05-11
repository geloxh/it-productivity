const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
}, { _id: true, timestamps: true });

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To-Do', 'In-Progress', 'Review', 'Done'], default: 'To-Do' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    dueDate: { type: Date },
    subtasks: [subtaskSchema],
    relatedTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    relatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
}, { timestamps: true });

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
