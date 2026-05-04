const express = require('express');
const router = express.Router();
const { validate } = require('../../middleware/validate');
const { checkPermission } = require('../../middleware/rbac');
const { createTicketSchema, updateTicketSchema } = require('../../validators/ticket.validator');
const ticketController = require('../../controller/ticketController');

router.post('/', checkPermission('tickets', 'create'), validate(createTicketSchema), ticketController.create);
router.get('/', checkPermission('tickets', 'read'), ticketController.getAll);

router.patch('/bulk', checkPermission('tickets', 'update'), ticketController.bulkUpdate);
router.delete('/bulk', checkPermission('tickets', 'delete'), ticketController.bulkDelete);

router.get('/:id', checkPermission('tickets', 'read'), ticketController.getById);
router.put('/:id', checkPermission('tickets', 'update'), validate(updateTicketSchema), ticketController.update);
router.delete('/:id', checkPermission('tickets', 'delete'), ticketController.remove);

module.exports = router;