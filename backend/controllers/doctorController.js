import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import escapeRegex from '../utils/escapeRegex.js';

/**
 * @desc    Get all doctors (with search and department filters)
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res) => {
  const { search, department } = req.query;

  try {
    let query = {};

    // 1. Apply Department Filter if selected
    if (department && department !== 'All') {
      query.department = department;
    }

    // 2. Apply Search Filter (matches doctor name or specialization via regex)
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { specialization: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    // Fetch matching doctor records
    const doctors = await Doctor.find(query).sort({ rating: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(`[Doctor Controller] Get Doctors error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load doctors list',
    });
  }
};

/**
 * @desc    Get single doctor details by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res) => {
  try {
    // Malformed IDs count as not found
    const doctor = mongoose.isValidObjectId(req.params.id)
      ? await Doctor.findById(req.params.id)
      : null;

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error(`[Doctor Controller] Get Doctor By ID error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not retrieve doctor details',
    });
  }
};
