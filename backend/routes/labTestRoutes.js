import express from 'express';
import {
  getLabTests,
  getLabTestById,
} from '../controllers/labTestController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getLabTests);

// Detail lookup Endpoint
router.get('/:id', getLabTestById);

export default router;
