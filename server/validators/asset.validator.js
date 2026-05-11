const { z } = require('zod');

const createAssetSchema = z.object({
    name: z.string().min(2).max(100),
    assetTag: z.string().min(3).max(50),
    serialNumber: z.string().optional(),
    category: z.enum(['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    deviceYearModel: z.string().optional(),
    systemInfo: z.string().optional(),
    user: z.string().optional(),
    formerUser: z.string().optional(),
    company: z.string().optional(),
    contractStatus: z.enum(['Active', 'Expired', 'None']).optional(),
    equipmentStatus: z.enum(['Good', 'Defective', 'For Repair', 'For Disposal']).optional(),
    dateAcquired: z.string().optional(),
    notes: z.string().optional(),
});

const updateAssetSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    assetTag: z.string().min(3).max(50).optional(),
    serialNumber: z.string().optional(),
    category: z.enum(['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']).optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    deviceYearModel: z.string().optional(),
    systemInfo: z.string().optional(),
    user: z.string().optional(),
    formerUser: z.string().optional(),
    company: z.string().optional(),
    contractStatus: z.enum(['Active', 'Expired', 'None']).optional(),
    equipmentStatus: z.enum(['Good', 'Defective', 'For Repair', 'For Disposal']).optional(),
    status: z.enum(['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost']).optional(),
    dateAcquired: z.string().optional(),
    notes: z.string().optional(),
    assignedTo: z.string().nullable().optional(),
});

module.exports = { createAssetSchema, updateAssetSchema };