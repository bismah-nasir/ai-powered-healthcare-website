import mongoose from 'mongoose';
import LabBooking from '../models/LabBooking.js';
import LabTest from '../models/LabTest.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS_AHEAD = 90; // How far ahead a sample collection can be scheduled

// Turns a 'YYYY-MM-DD' string into midnight UTC of that day, or null if it isn't a real calendar date
const parseCalendarDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Date.UTC rolls invalid days over (Feb 30 becomes Mar 2), so check nothing moved
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
};

/**
 * @desc    Book a lab test
 * @route   POST /api/lab-bookings
 * @access  Private
 */
export const createLabBooking = async (req, res) => {
  const { labTestId, patientName, contactPhone, collectionDate } = req.body;

  try {
    // 1. Basic validation
    if (typeof patientName !== 'string' || !patientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the patient name',
      });
    }

    if (typeof contactPhone !== 'string' || !contactPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a contact phone number',
      });
    }

    const date = parseCalendarDate(collectionDate);
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid sample collection date',
      });
    }

    // 2. The date must be today or later. "Today" is the patient's local day, which can be
    // one day behind UTC, so allow yesterday in UTC terms as well.
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (date.getTime() < todayUtc - DAY_MS) {
      return res.status(400).json({
        success: false,
        message: 'Sample collection date cannot be in the past',
      });
    }

    if (date.getTime() > todayUtc + MAX_DAYS_AHEAD * DAY_MS) {
      return res.status(400).json({
        success: false,
        message: `Sample collection can be scheduled at most ${MAX_DAYS_AHEAD} days ahead`,
      });
    }

    // 3. Look up the test so name and price come from the catalog, not the client (malformed IDs count as not found)
    const labTest = mongoose.isValidObjectId(labTestId) ? await LabTest.findById(labTestId) : null;
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic lab test package not found',
      });
    }

    // 4. Create and save the booking
    const booking = await LabBooking.create({
      patient: req.user.id, // Populated by auth middleware
      labTest: labTest._id,
      testName: labTest.name,
      price: labTest.price,
      patientName,
      contactPhone,
      collectionDate: date,
    });

    res.status(201).json({
      success: true,
      message: 'Lab test booked successfully!',
      data: booking,
    });
  } catch (error) {
    // Safety net for any schema rule not covered by the checks above (e.g. name or phone length)
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    console.error(`[LabBooking Controller] Booking error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, lab test booking failed',
    });
  }
};

/**
 * @desc    Get logged-in patient's lab test bookings
 * @route   GET /api/lab-bookings/my
 * @access  Private
 */
export const getMyLabBookings = async (req, res) => {
  try {
    // Fetch all bookings for the active user, sorted from newest to oldest
    const bookings = await LabBooking.find({ patient: req.user.id })
      .populate('labTest', 'name category sampleType reportTime fastingRequired')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(`[LabBooking Controller] Fetch list error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load lab booking history',
    });
  }
};
