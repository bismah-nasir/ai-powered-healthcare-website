import express from 'express';
import {
  getEmergencies,
} from '../controllers/emergencyController.js';

const router = express.Router();

// Directory List Endpoint
router.get('/', getEmergencies);

export default router;
