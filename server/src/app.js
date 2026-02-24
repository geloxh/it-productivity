const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const logger = require('../config/logger');
const errorHandler = require('../middleware/errorHandler');
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');
const apiRoutes = require('../routes');
const authRoutes = require('../routes/auth');


const app = express();

// CORS - must be early
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

// Logging
app.use(pinoHttp({ logger }));

// Security
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
}));

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Health check (before rate limiters)
app.get('/health', (req, res) => {
    res.json({ status: 'OK '});
});

// Rate limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

// Error handler
app.use(errorHandler);

module.exports = app;