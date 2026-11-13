const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllTickets,
  getAdminTicketById,
  updateStatus,
  assignTicket,
  addInternalNote,
  respondToTicket,
  updateCategory,
  updatePriority,
  regenerateDraftHandler,
  getDashboardStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/tickets',           getAllTickets);
router.get('/tickets/:id',       getAdminTicketById);
router.patch('/tickets/:id/status',           updateStatus);
router.patch('/tickets/:id/assign',           assignTicket);
router.post('/tickets/:id/internal-notes',    addInternalNote);
router.post('/tickets/:id/respond',           respondToTicket);
router.patch('/tickets/:id/category',         updateCategory);
router.patch('/tickets/:id/priority',         updatePriority);
router.post('/tickets/:id/regenerate-draft',  regenerateDraftHandler);

module.exports = router;
