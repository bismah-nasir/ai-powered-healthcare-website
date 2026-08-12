import express from 'express';
import {
  getEmergencies,
  seedEmergencies,
} from '../controllers/emergencyController.js';

const router = express.Router();

// Directory List Endpoint
router.get('/', getEmergencies);

// Developer Seeding Route
router.post('/seed', seedEmergencies);

export default router;
