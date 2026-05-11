const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['P1', 'P2', 'P3', 'P4'], required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    assetName: { type: String },
    groupKey: { type: String },
    count: { type: Number, default: 1 },
    source: { type: String, default: 'system' },
    category: {
        type: String,
        enum: ['Hardware', 'Software', 'Network', 'Security', 'Performance', 'Other'],
        default: 'Other'
    },
    acknowledgedBy: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            acknowledgedAt: { type: Date }
        }
    ],
    resolvedAt: { type: Date },
    isResolved: { type: Boolean, default: false }
}, { timestamps: true });

alertSchema.index({ groupKey: 1, isResolved: 1 });
alertSchema.index({ severity: 1, isResolved: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
