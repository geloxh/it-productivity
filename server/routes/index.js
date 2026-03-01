const express = require('express');
const router = express.Router();

// V1 Routes
const userRoutes = require('./v1/user.routes');
const ticketRoutes = require('./v1/ticket.routes');
const assetRoutes = require('./v1/asset.routes');
const projectRoutes = require('./v1/project.routes');
const taskRoutes = require('./v1/task.routes');
const authRoutes = require('./v1/auth.routes');
const sessionRoutes = require('./session.routes');
const departmentRoutes = require('./v1/department.routes');
const knowledgeBaseRoutes = require('./v1/knowledgeBase.routes');

router.use('/v1/users', userRoutes);
router.use('/v1/tickets', ticketRoutes);
router.use('/v1/assets', assetRoutes);
router.use('/v1/projects', projectRoutes);
router.use('/v1/tasks', taskRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/sessions', sessionRoutes);
router.use('/v1/departments', departmentRoutes);
router.use('/v1/knowledge-base', knowledgeBaseRoutes);

module.exports = router;