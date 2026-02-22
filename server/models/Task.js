const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAT: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

modules.exports = mongoose.model('Task', taskSchema);