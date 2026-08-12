import express from 'express';
import {
  getBlogs,
  getBlogById,
  seedBlogs,
} from '../controllers/blogController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getBlogs);

// Detail lookup Endpoint
router.get('/:id', getBlogById);

// Developer Seeding Route
router.post('/seed', seedBlogs);

export default router;
