const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const logger = require('../config/logger');
const errorHandler = require('../middleware/errorHandler');
const authRoutes = require('../routes/auth');

const app = express();

// Pino HTTP logging middleware
app.use(pinoHttp({ logger }));

// Security and parsing middleware
app.use(helmet());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// 404 Handler
app.use('*', (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode =  404;
    next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;