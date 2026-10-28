import express from 'express';
import { triageSymptoms } from '../controllers/triageController.js';
import { rateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public AI symptom triage route (rate limited to stay within Gemini quota)
router.post(
  '/',
  rateLimit({ max: 5, message: 'Too many symptom checks, please wait a minute and try again.' }),
  triageSymptoms
);

export default router;
