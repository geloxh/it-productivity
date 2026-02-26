const { verifyToken } = require('../utils/jwt');
const { validateSession } = require('../services/sessionService');
const logger = require('../config/logger');

const authenticate = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: { message: 'Access denied' } });
    }

    try {
        const decoded = verifyToken(token);
        const session = await validateSession(token);

        if (!session) {
            return res.status(401).json({ error: {message: 'Session expired or invalid.' } });
        }

        req.user = decoded;
        req.sessionId = session._id;
        next();
    } catch (error) {
        logger.error(error, 'Token verification failed');
        res.status(401).json({ error: { message: 'Invalid token' } });
    }
};

module.exports = { authenticate };