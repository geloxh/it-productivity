const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    assetTag: { type: String, unique: true, required: true },
    serialNumber: { type: String },

    category: {
        type: String,
        enum: [
            'Laptop', 
            'Desktop',
            'AIO'
        ],
        required: true
    },
    inclusions : {
        type: String,
        enum: [
            'MOUSE',
            'KEYBOARD',
            'MOUSE PAD',
            'LAPTOP CASE/BAG',
            'FLASH DRIVE',
            'CHARGER',
            'POWER CORD',
            'MONITOR'
        ]
    },
    manufacturer: { // brand
        type: String,
        enum: [
            'IPASON',
            'ACER',
            'RAZER',
            'RAPOO',
            'LOGITECH',
            'LENOVO',
            'BROTHER',
            'DELL',
            'CHICONY',
            'INTEX',
            'PROLINK',
            'HUNTKEY',
            'ASUS'
        ]
    },  
    model: { 
        type: String,
        enum: [
            'S14-72',
            'EXTENSA S14-52',
            'UNKNOWN',
            'EXTENSA 214-53',
            'SHANGQI A6470',
            '82XQ',
            '82XM',
            'SHANGQI A24-1500',
            'ASPIRE A314-35',
            'ASPIRE A514-52K',
            'VIVOBOOK -X1500EA',
            'ASPIRE A315-510P',
            'F0HN00KFCD',
            '83K0'
        ]
    },
    deviceYearModel: { type: String },
    systemInfo: { 
        type: String,
        enum: [
            'MICROSOFT WINDOWS SERVER',
            'MICROSOFT WINDOWS 10 PRO',
            'MICROSOFT WINDOWS 10 HOME SINGLE LANGUAGE',
            'MICROSOFT WINDOWS 11 HOME SINGLE LANGUAGE ',
            'MICROSOFT WINDOWS 11 PRO'
        ]
    },   

    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
        default: 'Available'
    },
    equipmentStatus: {
        type: String,
        enum: [
            'Excellent', 
            'Good', 
            'Fair', 
            'Poor',
            'Scrap'
        ],
        default: 'Good'
    },
    contractStatus: {
        type: String,
        enum: ['Active', 'Resigned', 'Awol', 'Terminated'],
        default: 'None'
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    user: { type: String },         
    formerUser: { type: String },
    company: { 
        type: String,
        enum: ['SPK', '3E', 'PowerNet', 'NORM' ]
    },

    dateAcquired: { type: Date },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    notes: { type: String },
    specifications: { type: Map, of: String },
}, { timestamps: true });

assetSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Asset', assetSchema);