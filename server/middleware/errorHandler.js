const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error.error({
        err,
        req: { method: req.method, url: req.url },
        res: { statusCode: res.statusCode }
    }, 'Request error');

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...err(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorHandler;