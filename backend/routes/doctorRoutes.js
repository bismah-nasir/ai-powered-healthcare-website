import express from 'express';
import {
  getDoctors,
  getDoctorById,
  seedDoctors,
} from '../controllers/doctorController.js';

const router = express.Router();

// Public Routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Dev Utility Seeding Route (In production, this would be restricted or removed)
router.post('/seed', seedDoctors);

export default router;
