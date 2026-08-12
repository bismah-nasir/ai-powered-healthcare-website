import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require user authorization
router.use(protect);

// Patient endpoints
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Admin-only endpoints
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
