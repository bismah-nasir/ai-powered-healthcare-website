import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
export const bookAppointment = async (req, res) => {
  const { doctorId, slotId, symptoms } = req.body;

  try {
    // 1. Basic validation
    if (!doctorId || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor ID and slot ID',
      });
    }

    // 2. Fetch the target doctor and verify their profile exists (malformed IDs count as not found)
    const doctor = mongoose.isValidObjectId(doctorId) ? await Doctor.findById(doctorId) : null;
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // 3. Locate the slot inside the doctor's availableSlots array
    const slot = mongoose.isValidObjectId(slotId) ? doctor.availableSlots.id(slotId) : null;
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Selected time slot not found on this doctor schedule',
      });
    }

    // 4. Verify slot is not already booked
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }

    // 5. ATOMIC UPDATE: Mark slot as booked inside Doctor document
    // We query with the condition that isBooked is still false to prevent concurrency race conditions.
    // $elemMatch makes both conditions apply to the same slot, so $ points at that slot.
    const updatedDoctor = await Doctor.findOneAndUpdate(
      {
        _id: doctorId,
        availableSlots: { $elemMatch: { _id: slotId, isBooked: false } }, // Concurrency guard
      },
      {
        $set: { 'availableSlots.$.isBooked': true },
      },
      { returnDocument: 'after' }
    );

    if (!updatedDoctor) {
      return res.status(400).json({
        success: false,
        message: 'This time slot was just booked by another user. Please choose another slot.',
      });
    }

    // 6. Create and save the Appointment document
    const appointment = new Appointment({
      patient: req.user.id, // Populated by auth middleware
      doctor: doctorId,
      slotId,
      day: slot.day,
      time: slot.time,
      symptoms,
      consultationFee: doctor.consultationFee,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment,
    });
  } catch (error) {
    console.error(`[Appointment Controller] Booking error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, booking failed',
    });
  }
};

/**
 * @desc    Get logged-in patient's appointments history
 * @route   GET /api/appointments/my
 * @access  Private (Patient only)
 */
export const getMyAppointments = async (req, res) => {
  try {
    // Fetch all appointments for the active user, sorted from newest to oldest
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialization department imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error(`[Appointment Controller] Fetch list error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load appointment history',
    });
  }
};

/**
 * @desc    Cancel an appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private (Patient only)
 */
export const cancelAppointment = async (req, res) => {
  try {
    // 1. Fetch appointment and verify it exists (malformed IDs count as not found)
    const appointment = mongoose.isValidObjectId(req.params.id)
      ? await Appointment.findById(req.params.id)
      : null;
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // 2. Security Check: Verify user owns this appointment
    // (403: the user is logged in, just not allowed to touch someone else's booking)
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this appointment',
      });
    }

    // 3. Only upcoming appointments can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled',
      });
    }

    // 4. Update status only if it is still cancellable, so a repeated cancel request
    // can't unlock the slot again after someone else has booked it
    const cancelled = await Appointment.findOneAndUpdate(
      { _id: appointment._id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );

    if (!cancelled) {
      return res.status(409).json({
        success: false,
        message: 'This appointment was just updated. Please refresh and try again.',
      });
    }

    // 5. Unlock the slot in the Doctor document
    await Doctor.findOneAndUpdate(
      {
        _id: appointment.doctor,
        'availableSlots._id': appointment.slotId,
      },
      {
        $set: { 'availableSlots.$.isBooked': false },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully!',
      data: cancelled,
    });
  } catch (error) {
    console.error(`[Appointment Controller] Cancellation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, cancellation failed',
    });
  }
};
