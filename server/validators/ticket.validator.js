const { z } = require('zod');

const createTicketSchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    relatedAsset: z.string().optional()
});

const updateTicketSchema = z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(10).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    status: z.enum(['Open', 'In-Progress', 'Resolved', 'Closed']).optional(),
    assignedTo: z.string().optional()
});

const addCommentSchema = z.object({
    text: z.string().min(1).max(1000)
});

module.exports = { createTicketSchema, updateTicketSchema, addCommentSchema };
