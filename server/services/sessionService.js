const Session = require('../models/Session');

const createSession = async (userId, token, expiresAt, req) => {
    return await Session.create({
        userId,
        token,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt
    });
};

const getActiveSessions = async (userId) => {
    return await Session.find({
        userId,
        expiresAt: { $gt: new Date() }
    }).select('-token').sort({ createdAt: -1 });
};

const deleteSession = async (token) => {
    return await Session.deleteOne({ token });
};

const deleteAllUserSessions = async (userId, exceptToken = null) => {
    const query = { userId };
    if (exceptToken) query.token = { $ne: exceptToken };
    return await Session.deleteMany(query);
};

const validateSession = async (token) => {
    const session = await Session.findOne({
        token,
        expiresAt: { $gt: new Date() }
    });
    return session;
};

module.exports = { createSession, getActiveSessions, deleteSession, deleteAllUserSessions, validateSession };