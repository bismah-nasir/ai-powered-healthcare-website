import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

// Private/Protected Routes
router.get('/profile', protect, getUserProfile);

export default router;
