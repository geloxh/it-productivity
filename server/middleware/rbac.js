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