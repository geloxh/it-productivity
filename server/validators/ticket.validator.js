const { z } = require('zod');

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other'];

const createTicketSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(1),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignedTo: z.string().optional(),
    relatedAsset: z.string().optional()
});

const updateTicketSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(1).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    status: z.enum(['Open', 'In-Progress', 'Resolved', 'Closed']).optional(),
    assignedTo: z.string().optional()
});

const addCommentSchema = z.object({
    text: z.string().min(1).max(1000)
});

module.exports = { createTicketSchema, updateTicketSchema, addCommentSchema };
