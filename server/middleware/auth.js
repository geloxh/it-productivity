const { verifyToken } = require('../utils/jwt');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
    const token = req.cokkies.token;

    if (!token) {
        return res.status(401).json({ error: { message: 'Access denied' } });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(error, 'Token verification failed');
        res.status(401).json({ error: { message: 'Invalid token' } });
    }
};

modules.exports = { authneticate };