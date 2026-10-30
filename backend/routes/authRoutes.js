import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Public Routes (rate limited per IP to slow down password guessing, spam signups and email flooding)
router.post(
  '/signup',
  rateLimit({ windowMs: ONE_HOUR, max: 5, message: 'Too many accounts created, please try again later.' }),
  registerUser
);
router.post(
  '/login',
  rateLimit({ windowMs: FIFTEEN_MINUTES, max: 10, message: 'Too many login attempts, please try again in 15 minutes.' }),
  loginUser
);
router.post(
  '/forgot-password',
  rateLimit({ windowMs: FIFTEEN_MINUTES, max: 3, message: 'Too many password reset requests, please try again in 15 minutes.' }),
  forgotPassword
);
router.post('/reset-password/:token', resetPassword);

// Private/Protected Routes
router.get('/profile', protect, getUserProfile);

export default router;
