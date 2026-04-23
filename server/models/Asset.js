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
    deviceYearModel: { type: String },
    systemInfo: { type: String },   

    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
        default: 'Available'
    },
    equipmentStatus: {
        type: String,
        enum: ['Good', 'Defective', 'For Repair', 'For Disposal'],
        default: 'Good'
    },
    contractStatus: {
        type: String,
        enum: ['Active', 'Expired', 'None'],
        default: 'None'
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    user: { type: String },         
    formerUser: { type: String },
    company: { type: String },

    dateAcquired: { type: Date },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    notes: { type: String },
    specifications: { type: Map, of: String },
}, { timestamps: true });

assetSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Asset', assetSchema);