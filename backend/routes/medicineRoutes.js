import express from 'express';
import {
  getMedicines,
  getMedicineById,
  seedMedicines,
} from '../controllers/medicineController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getMedicines);

// Detail lookup Endpoint
router.get('/:id', getMedicineById);

// Developer Seeding Route
router.post('/seed', seedMedicines);

export default router;
