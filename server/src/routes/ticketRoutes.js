const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  createTicket,
  getMyTickets,
  getTicketById,
  regenerateDraftForTicket
} = require('../controllers/ticketController');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required')
      .isLength({ min: 5 }).withMessage('Subject must be at least 5 characters')
      .isLength({ max: 150 }).withMessage('Subject cannot exceed 150 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
  ],
  createTicket
);

router.get('/my-tickets', getMyTickets);

router.post('/:id/regenerate-draft', roleMiddleware('admin'), regenerateDraftForTicket);

router.get('/:id', getTicketById);

module.exports = router;
