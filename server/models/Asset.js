const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    assetTag: { type: String, unique: true, required: true },
    serialNumber: { type: String },

    category: {
        type: String,
        enum: ['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile'],
        required: true
    },
    manufacturer: { type: String },
    model: { type: String },

    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
        default: 'Available'
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    specifications: { type: Map, of: String }, // Flexible Object for RAM, CPU, etc.
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);