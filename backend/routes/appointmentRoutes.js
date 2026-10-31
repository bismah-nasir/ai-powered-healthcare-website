import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  completeAppointment,
} from '../controllers/appointmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All appointment management routes require user authentication
router.use(protect);

// Booking operations
router.post('/', bookAppointment);
router.get('/my', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);

// Admin-only endpoints
router.get('/', adminOnly, getAllAppointments);
router.patch('/:id/complete', adminOnly, completeAppointment);

export default router;
