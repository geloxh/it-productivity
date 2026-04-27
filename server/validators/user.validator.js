const { z } = require('zod');

const registerSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    username: z.string().min(3).max(30),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    role: z.enum(['SysAdmin', 'Admin', 'Employee', 'Guest']).optional(),
    employeeId: z.string().optional(),
    department: z.string().optional(),
    jobTitle: z.string().optional()
});

const loginSchema = z.object({
    identifier: z.string().min(1),
    password: z.string().min(1)
});

const updateUserSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    jobTitle: z.string().optional(),
    phoneNumber: z.string().optional(),
    department: z.string().optional()
});

module.exports = { registerSchema, loginSchema, updateUserSchema };
