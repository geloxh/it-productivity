const { z } = require('zod');

const createAssetSchema = z.object ({
    name: z.string().min(2).max(100),
    assetTag: z.string().min(3).max(50),
    serialNumber: z.string().optional(),
    category: z.enum(['Laptop', 'Desktop', 'Server', 'Network', 'Peripheral', 'Software', 'Mobile']),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    purchaseDate: z.string().dateTime.optional(),
    warrantyExpiry: z.string().datetime().optional()
});

const updateAssetSchema = z.object ({
    name: z.string().min(2).max(100).optional(),
    status: z.enum(['Available', 'Assigned', 'Maintenance', 'Operating', 'Broken']).optional(),
    assignedTo: z.string().nullable().optional()
});

module.exports = { createAssetSchema, updateAssetSchema };