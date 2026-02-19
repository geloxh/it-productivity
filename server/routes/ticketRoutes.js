const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');
const { validate } = require('../middleware/validate');
const { createTicketSchema, updateTicketSchema, addCommentSchema } = require('../validators/ticket.validator');
const { ticketLimiter } = require('../middleware/rateLimiter');

router.post('/', ticketLimiter, validate(createTicketSchema), ticketController.create);
router.put('/:id', validate(updateTicketSchema), ticketController.update);
router.post('/:id/comments', validate(addCommentSchema), ticketController.addComment);

module.exports = router;