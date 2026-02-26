const { getActiveSessions, deleteAllUserSessions, deleteSession } = require('../services/sessionService');

exports.getActiveSessions = async (req, res, next) => {
    try {
        const sessions = await getActiveSessions(req.user.id);
        res.json({ sessions });
    } catch (error) {
        next(error);
    }
};

exports.logoutAllDevices = async (req, res, next) => {
    try {
        await deleteAllUserSessions(req.user.id);
        res.clearCookie('token');
        res.json({ message: 'Logged out from all devices.' });
    } catch (error) {
        next(error);
    }
};

exports.logoutOtherDevices = async (req, res, next) => {
    try {
        const currentToken = req.cookies.token;
        await deleteAllUserSessions(req.user.id, currentToken);
        res.json({ message: 'Logged out from other devices.' });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;