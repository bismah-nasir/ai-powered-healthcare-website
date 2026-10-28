import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

const PAYMENT_METHODS = ['COD', 'Card'];

// Adds reserved quantities back to stock when checkout fails partway
const restoreStock = (reservedItems) =>
  Promise.all(
    reservedItems.map((item) =>
      Medicine.updateOne({ _id: item.medicine }, { $inc: { stock: item.quantity } })
    )
  );

/**
 * @desc    Create a new medicine order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  const { items, shippingAddress, contactPhone, paymentMethod } = req.body;
  const reserved = []; // Items whose stock has been deducted but not yet confirmed by a saved order

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

    // Merge duplicate cart lines so each medicine is checked against its total quantity
    const mergedItems = new Map();
    for (const item of items) {
      const id = String(item._id);
      const existing = mergedItems.get(id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedItems.set(id, { name: item.name, quantity: item.quantity });
      }
    }

    const orderItems = [];
    let calculatedSubtotal = 0;

    // 1. Look up catalog details and prices
    for (const [id, item] of mergedItems) {
      const med = await Medicine.findById(id);

      if (!med) {
        return res.status(404).json({
          success: false,
          code: 'ITEM_NOT_FOUND',
          message: `Medicine not found in catalog: ${item.name}`,
          item: { medicineId: id, name: item.name },
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

    // 2. Reserve stock atomically: each update only succeeds if enough stock remains,
    // so simultaneous orders cannot both take the last units
    for (const item of orderItems) {
      const updated = await Medicine.findOneAndUpdate(
        { _id: item.medicine, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        await restoreStock(reserved);
        reserved.length = 0;
        const current = await Medicine.findById(item.medicine).select('stock');
        const available = current ? current.stock : 0;
        // Structured details let the frontend highlight the item and offer to adjust it
        return res.status(400).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${item.name}. Only ${available} units available.`,
          item: {
            medicineId: String(item.medicine),
            name: item.name,
            requested: item.quantity,
            available,
          },
        });
      }

      reserved.push(item);
    }

    // 3. Billing calculations
    const deliveryFee = calculatedSubtotal > 1500 ? 0 : 150;
    const orderTotal = calculatedSubtotal + deliveryFee;

    // 4. Create the order
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
    reserved.length = 0; // Order saved, stock deduction is now final

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Thank you for your purchase!',
      data: order,
    });
  } catch (error) {
    // Give back any stock reserved before the failure
    try {
      await restoreStock(reserved);
    } catch (restoreError) {
      console.error(`[Order Controller] Stock restore failed: ${restoreError.message}`);
    }

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
