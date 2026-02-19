const express = require('express');
const apiRoutes = require('../routes');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const logger = require('../config/logger');
const errorHandler = require('../middleware/errorHandler');
const authRoutes = require('../routes/auth');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); // Assuming you create this
const assetRoutes = require('./routes/assetRoutes');   // Assuming you create this
const cors = require('cors');
const { apiLimiter, authLimiter, ticketLimiter } = require('../middleware/rateLimiter');


const app = express();

// Pino HTTP logging middleware
app.use(pinoHttp({ logger }));

// Middleware to parse JSON bodies
app.use(express.json());

// Security and parsing middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc:  ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    crossOriginEmbedderPolicy: false
}));

// For dev use
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbeddedrPolicy: false
}));

// Mount the routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/assets', assetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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

// Apply general auth to all API routes
app.use('/api/', apiLimiter);

app.use('/api', apiRoutes);

// Configure CORS
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' }));

module.exports = app;