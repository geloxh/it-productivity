const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { createTicketSchema, updateTicketSchema, addCommentSchema } = require('../validators/ticket.validator');
const { tickeTLimiter } = require('../middleware/rateLimiter');

router.post('/', validate(createTicketSchema), ticketController.creatge);
router.put('/:id', validate(updateTicketSchema), ticketController.update);
router.post('/:id/comments', validate(addCommentSchema), ticketController.addComment);

router.post('/', ticketLimiter, validate(createTicketSchema), ticketController.create);

module.exports = router;