import Doctor from '../models/Doctor.js';

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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
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
    const doctor = await Doctor.findById(req.params.id);
    
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
    
    // Check if error is due to an invalid Mongoose Object ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error, could not retrieve doctor details',
    });
  }
};
