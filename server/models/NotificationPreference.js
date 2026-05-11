const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    preferences: [
        {
            alertCategory: { type: String },
            severity: { type: String, enum: ['P1', 'P2', 'P3', 'P4', 'All'] },
            inApp: { type: Boolean, default: true },
            email: { type: Boolean, default: false }
        }
    ],
    orgDefaults: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
