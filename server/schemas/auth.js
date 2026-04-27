const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email('Invalid email format.'),
    password: z.string().min(6, 'Password must be at least 6 characters.')
});

const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or username is required.'),
    password: z.string().min(1, 'Password is required.')
});

module.exports = { registerSchema, loginSchema };
