const { z } = require('zod');

const createProjectSchema = z.object ({
    name: z.string().min(3).max(100),
    description: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    members: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});

const updateProjectSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    status: z.enum(['Plannning', 'Active', 'On-Hold', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical' ]).optional(),
    members: z.array(z.string()).optional()
});

module.exports = { createProjectSchema, updateProjectSchema };