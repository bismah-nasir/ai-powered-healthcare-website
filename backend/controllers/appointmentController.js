import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { DAY_MS, currentSlotDate, startOfUtcDay } from '../utils/slotDates.js';

const SYMPTOMS_MAX_LENGTH = 1000; // Keep in sync with the Appointment schema maxlength
const WEEK_MS = 7 * DAY_MS;

// Mark an appointment's slot free again. Only a slot that is still booked is touched,
// and `extra` can set other slot fields at the same time (e.g. move its date on a week).
const releaseSlot = (appointment, extra = {}) =>
  Doctor.updateOne(
    {
      _id: appointment.doctor,
      availableSlots: { $elemMatch: { _id: appointment.slotId, isBooked: true } },
    },
    { $set: { 'availableSlots.$.isBooked': false, ...extra } }
  );

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

    // Symptoms are optional free text; reject anything that isn't a reasonably sized string
    if (symptoms !== undefined && (typeof symptoms !== 'string' || symptoms.length > SYMPTOMS_MAX_LENGTH)) {
      return res.status(400).json({
        success: false,
        message: `Symptoms must be text of at most ${SYMPTOMS_MAX_LENGTH} characters`,
      });
    }

    // The calendar date this slot is offered for right now (the same date the doctor page shows)
    const slotDate = currentSlotDate(slot);
    if (!slotDate) {
      return res.status(400).json({
        success: false,
        message: 'This time slot has no valid weekday. Please choose another slot.',
      });
    }

    // 5. ATOMIC UPDATE: Mark slot as booked for that date inside Doctor document
    // We query with the condition that isBooked is still false to prevent concurrency race conditions.
    // $elemMatch makes both conditions apply to the same slot, so $ points at that slot.
    const updatedDoctor = await Doctor.findOneAndUpdate(
      {
        _id: doctorId,
        availableSlots: { $elemMatch: { _id: slotId, isBooked: false } }, // Concurrency guard
      },
      {
        $set: { 'availableSlots.$.isBooked': true, 'availableSlots.$.date': slotDate },
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
      date: slotDate,
      time: slot.time,
      symptoms,
      consultationFee: doctor.consultationFee,
    });

    try {
      await appointment.save();
    } catch (saveError) {
      // The slot is already marked booked, so give it back or it stays locked with no appointment
      try {
        await releaseSlot(appointment);
      } catch (releaseError) {
        console.error(`[Appointment Controller] Slot release failed: ${releaseError.message}`);
      }
      throw saveError;
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment,
    });
  } catch (error) {
    // Safety net for any schema rule not covered by the checks above
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

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

    // A visit whose day has gone by can't be cancelled (the admin completes it instead).
    // "Today" is the patient's local day, which can be one day behind UTC, so allow yesterday in UTC terms as well.
    if (appointment.date && appointment.date.getTime() < startOfUtcDay().getTime() - DAY_MS) {
      return res.status(400).json({
        success: false,
        message: 'This appointment date has already passed, so it can no longer be cancelled',
      });
    }

    // 4. Update status only if it is still cancellable, so a repeated cancel request
    // can't unlock the slot again after someone else has booked it
    const cancelled = await Appointment.findOneAndUpdate(
      { _id: appointment._id, status: 'confirmed' },
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );

    if (!cancelled) {
      return res.status(409).json({
        success: false,
        message: 'This appointment was just updated. Please refresh and try again.',
      });
    }

    // 5. Unlock the slot in the Doctor document (it is offered again for the same date)
    await releaseSlot(appointment);

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

/**
 * @desc    Get all appointments (for Admin dashboard)
 * @route   GET /api/appointments
 * @access  Private (Admin only)
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error(`[Appointment Controller] Fetch all appointments error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not retrieve appointment records',
    });
  }
};

/**
 * @desc    Mark an appointment as completed and free its slot for the next week
 * @route   PATCH /api/appointments/:id/complete
 * @access  Private (Admin only)
 */
export const completeAppointment = async (req, res) => {
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

    // 2. Only upcoming appointments can be completed
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already completed',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled appointments cannot be completed',
      });
    }

    // 3. A visit can't be completed before its day. "Today" is the admin's local day,
    // which can be one day ahead of UTC, so allow tomorrow in UTC terms as well.
    if (appointment.date && appointment.date.getTime() > startOfUtcDay().getTime() + DAY_MS) {
      return res.status(400).json({
        success: false,
        message: 'This appointment has not taken place yet. It can be completed from its scheduled date.',
      });
    }

    // 4. Update status only if it is still open, so a repeated request can't free the slot
    // again after someone else has booked it
    const completed = await Appointment.findOneAndUpdate(
      { _id: appointment._id, status: 'confirmed' },
      { status: 'completed' },
      { returnDocument: 'after' }
    );

    if (!completed) {
      return res.status(409).json({
        success: false,
        message: 'This appointment was just updated. Please refresh and try again.',
      });
    }

    // 5. Free the slot. Its booked date is used up, so it is offered again a week later
    // (or on its next weekday after that, if that date has passed too).
    await releaseSlot(
      appointment,
      appointment.date ? { 'availableSlots.$.date': new Date(appointment.date.getTime() + WEEK_MS) } : {}
    );

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: completed,
    });
  } catch (error) {
    console.error(`[Appointment Controller] Completion error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not complete appointment',
    });
  }
};
