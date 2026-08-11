import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All appointment management routes require user authentication
router.use(protect);

// Booking operations
router.post('/', bookAppointment);
router.get('/my', getMyAppointments);
router.put('/:id/cancel', cancelAppointment);

export default router;
