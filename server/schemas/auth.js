const { z } = require('zod');

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    email: z.string().email('Invalid email format.'),
    username: z.string().min(3, 'Username must be at least 3 characters.'),
    password: z.string().min(6, 'Password must be at least 6 characters.')
});

const loginSchema = z.object({
    identifier: z.string().min(1, 'Email or username is required.'),
    password: z.string().min(1, 'Password is required.')
});

module.exports = { registerSchema, loginSchema };
