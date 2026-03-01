const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Planning', 'Active', 'Pending', 'Completed', 'Cancelled'], default: 'Planning'},
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium'},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    startDate: { type: Date },
    endDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Project', projectSchema);