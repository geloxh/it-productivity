const { z } = require('zod');

const subtaskSchema = z.object({
    title: z.string().min(1).max(200),
    done: z.boolean().optional(),
});

const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    project: z.string(),
    assignedTo: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    dueDate: z.string().datetime().optional(),
    subtasks: z.array(subtaskSchema).optional(),
    relatedTicket: z.string().optional(),
    relatedAsset: z.string().optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['To-Do', 'In-Progress', 'Review', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    subtasks: z.array(subtaskSchema.extend({ _id: z.string().optional() })).optional(),
    relatedTicket: z.string().optional(),
    relatedAsset: z.string().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
