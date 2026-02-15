const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit ({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 5, // 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict limiter for auth routes
 */
const authLimiter = rateLimit ({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 Login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});