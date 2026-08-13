import LabTest from '../models/LabTest.js';

/**
 * @desc    Get all lab tests (supports filtering, search)
 * @route   GET /api/labs
 * @access  Public
 */
export const getLabTests = async (req, res) => {
  const { category, search } = req.query;

  try {
    const query = {};

    // 1. Category filter
    if (category) {
      query.category = category;
    }

    // 2. Search filter (regex name/description match)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const labTests = await LabTest.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: labTests.length,
      data: labTests,
    });
  } catch (error) {
    console.error(`[LabTest Controller] Fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load lab tests directory',
    });
  }
};

/**
 * @desc    Get single lab test details
 * @route   GET /api/labs/:id
 * @access  Public
 */
export const getLabTestById = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic lab test package not found',
      });
    }

    res.status(200).json({
      success: true,
      data: labTest,
    });
  } catch (error) {
    console.error(`[LabTest Controller] ID lookup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, invalid lab test ID format',
    });
  }
};
