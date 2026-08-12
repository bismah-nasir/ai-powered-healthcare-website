import express from 'express';
import {
  submitContactForm,
  getContactSubmissions,
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public submission route
router.post('/', submitContactForm);

// Private query route (Administrators only)
router.get('/', protect, adminOnly, getContactSubmissions);

export default router;
