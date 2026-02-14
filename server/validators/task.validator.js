const { z } = require('zod');

const createTaskSchema = z.object ({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    project: z.string(),
    assignedTo: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    dueDate: z.string().datetime().optional()
});

const updateTaskSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    status: z.enum(['To-Do', 'In-Progress', 'Review', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().datetime().optiona()
});

module.exports = { createTaskSchema, updateTaskSchema };