const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Raised to 500 req/15min — desktop app with polling (alerts every 30s,
 * dashboard widgets, etc.) easily exceeds 100 in normal use.
 * skipSuccessfulRequests means only errors count toward the limit.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only failed/error responses count
});

/**
 * Strict limiter for login/register only.
 * /me and /logout are NOT covered by this — they use apiLimiter.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // raised from 5 — allows a few retries without locking out
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Moderate limiter for ticket creation
 */
const ticketLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // raised from 10 — bulk import can create many tickets
    message: 'Too many tickets created, please slow down.',
    skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter, ticketLimiter };
