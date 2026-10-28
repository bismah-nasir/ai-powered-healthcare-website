import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

const PAYMENT_METHODS = ['COD', 'Card'];

/**
 * @desc    Create a new medicine order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  const { items, shippingAddress, contactPhone, paymentMethod } = req.body;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart to checkout',
      });
    }

    if (typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a shipping address',
      });
    }

    if (typeof contactPhone !== 'string' || !contactPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a contact phone number',
      });
    }

    // Payment method is optional (schema defaults to COD) but must be valid if sent
    if (paymentMethod !== undefined && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Choose one of: ${PAYMENT_METHODS.join(', ')}`,
      });
    }

    // Reject malformed items before touching the database
    for (const item of items) {
      if (!item || !mongoose.isValidObjectId(item._id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item in cart. Please remove it and try again.',
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Quantity for ${item.name || 'an item'} must be a whole number of at least 1`,
        });
      }
    }

    const orderItems = [];
    let calculatedSubtotal = 0;

    // 1. Validate stocks and populate items details
    for (const item of items) {
      const med = await Medicine.findById(item._id);

      if (!med) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found in catalog: ${item.name}`,
        });
      }

      // Check stock availability
      if (med.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${med.name}. Only ${med.stock} units available.`,
        });
      }

      // Populate item values for caching
      orderItems.push({
        medicine: med._id,
        name: med.name,
        price: med.price,
        quantity: item.quantity,
      });

      calculatedSubtotal += med.price * item.quantity;
    }

    // 2. Billing calculations
    const deliveryFee = calculatedSubtotal > 1500 ? 0 : 150;
    const orderTotal = calculatedSubtotal + deliveryFee;

    // 3. Create the order
    const order = new Order({
      patient: req.user.id,
      items: orderItems,
      shippingAddress,
      contactPhone,
      paymentMethod,
      subtotal: calculatedSubtotal,
      deliveryFee,
      orderTotal,
    });

    await order.save();

    // 4. Deduct medicine stock levels atomically
    for (const item of orderItems) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Thank you for your purchase!',
      data: order,
    });
  } catch (error) {
    // Safety net for any schema rule not covered by the checks above
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    console.error(`[Order Controller] Checkout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, checkout failed. Please try again.',
    });
  }
};

/**
 * @desc    Get logged in user orders list
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ patient: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(`[Order Controller] Fetch user orders error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load purchase history',
    });
  }
};

/**
 * @desc    Get all orders list (for Admin dashboard)
 * @route   GET /api/orders
 * @access  Private (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(`[Order Controller] Fetch all orders error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not retrieve orders logs',
    });
  }
};

/**
 * @desc    Update order delivery status
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status code. Choose from: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found',
      });
    }

    // Revert stock if order is cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error(`[Order Controller] Update status error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, status modification failed',
    });
  }
};
