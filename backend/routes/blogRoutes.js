import express from 'express';
import {
  getBlogs,
  getBlogById,
} from '../controllers/blogController.js';

const router = express.Router();

// Catalog Browsing Endpoint
router.get('/', getBlogs);

// Detail lookup Endpoint
router.get('/:id', getBlogById);

export default router;
