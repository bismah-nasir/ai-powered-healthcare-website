import express from 'express';
import {
  submitContactForm,
  getContactSubmissions,
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public submission route (rate limited per IP to stop form spam)
router.post(
  '/',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many messages sent, please try again in 15 minutes.' }),
  submitContactForm
);

// Private query route (Administrators only)
router.get('/', protect, adminOnly, getContactSubmissions);

export default router;
