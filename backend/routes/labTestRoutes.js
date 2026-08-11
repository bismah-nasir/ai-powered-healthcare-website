import express from 'express';
import {
  getLabTests,
  getLabTestById,
  seedLabTests,
} from '../controllers/labTestController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getLabTests);

// Detail lookup Endpoint
router.get('/:id', getLabTestById);

// Developer Seeding Route
router.post('/seed', seedLabTests);

export default router;
