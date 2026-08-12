import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Medicine from '../models/Medicine.js';
import Contact from '../models/Contact.js';
import Order from '../models/Order.js';

/**
 * @desc    Get portal stats and recent logs
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res) => {
  try {
    // 1. Gather document counts concurrently
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalMedicines,
      totalTickets,
      totalOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Medicine.countDocuments(),
      Contact.countDocuments(),
      Order.countDocuments(),
    ]);

    // 2. Fetch recent support tickets
    const recentTickets = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Fetch recent appointments with populated fields
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name specialization email')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Fetch recent pharmacy orders with populated patient
    const recentOrders = await Order.find()
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalMedicines,
          totalTickets,
          totalOrders,
        },
        recentTickets,
        recentAppointments,
        recentOrders,
      },
    });
  } catch (error) {
    console.error(`[Admin Controller] Stats aggregate error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load administration dashboard statistics',
    });
  }
};

/**
 * @desc    Update a contact support ticket's status
 * @route   PATCH /api/admin/tickets/:id
 * @access  Private (Admin only)
 */
export const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Validate target status
    const validStatuses = ['unread', 'read', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status code. Choose from: ${validStatuses.join(', ')}`,
      });
    }

    const ticket = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support ticket status updated successfully',
      data: ticket,
    });
  } catch (error) {
    console.error(`[Admin Controller] Ticket status update error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not update support ticket status',
    });
  }
};
