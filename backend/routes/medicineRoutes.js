import express from 'express';
import {
  getMedicines,
  getMedicineById,
} from '../controllers/medicineController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getMedicines);

// Detail lookup Endpoint
router.get('/:id', getMedicineById);

export default router;
