const PERMISSIONS = {
    tickets: {
        SysAdmin: ['create', 'read', 'update', 'delete', 'assign'],
        Admin: ['create', 'read', 'update', 'assign'],
        Employee: ['create', 'read', 'update:own'],
        Guest: ['read:own']
    },

    users: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['read', 'update:department'],
        Employee: ['read:own', 'update:own'],
        Guest: ['read:own']
    },

    projects: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['create', 'read', 'update', 'delete:own'],
        Employee: ['read', 'update:assigned'],
        Guest: ['read:assigned']
    },

    tasks: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['create', 'read', 'update', 'delete:own'],
        Employee: ['create', 'read', 'update:assigned'],
        Guest: ['read:assigned']
    },

    assets: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['create', 'update:department'],
        Employee: ['read'],
        Guest: []
    },

    departments: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['read'],
        Employee: ['read'],
        Guest: ['read']
    },

    knowledgeBase: {
        SysAdmin: ['create', 'read', 'update', 'delete'],
        Admin: ['create', 'read', 'update'],
        Employee: ['create', 'read'],
        Guest: ['read']
    }
};

const checkPermission = (resource, action) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permissions = PERMISSIONS[resource]?.[userRole] || [];

        if (permissions.includes(action) || permissions.includes(action.split(':')[0])) {
            return next();
        }

        return res.status(403).json({ error: { message: 'Access denied.'} });
    };
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({ error: {message: 'Insufficient permissions' } });
    };
};

module.exports = { checkPermission, requireRole, PERMISSIONS };