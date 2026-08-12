import express from 'express';
import {
  getAdminStats,
  updateTicketStatus,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require token validation and administrator role verification
router.use(protect);
router.use(adminOnly);

// Aggregate statistics and recent logs
router.get('/stats', getAdminStats);

// Update support ticket statuses
router.patch('/tickets/:id', updateTicketStatus);

export default router;
