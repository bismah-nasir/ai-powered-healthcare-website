import express from 'express';
import {
  createLabBooking,
  getMyLabBookings,
} from '../controllers/labBookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All lab booking routes require user authentication
router.use(protect);

// Booking operations
router.post('/', createLabBooking);
router.get('/my', getMyLabBookings);

export default router;
