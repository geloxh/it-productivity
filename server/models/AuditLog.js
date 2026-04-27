const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    changes: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    ipAddress: { type: String },
    userAgent: { type: String },
    timeStamp: { type: Date, default: Date.now }
}, { capped: { size: 10485760, max: 50000 }, versionKey: false });

auditLogSchema.index({ user: 1, timeStamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);