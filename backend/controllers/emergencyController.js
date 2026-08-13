import Emergency from '../models/Emergency.js';

/**
 * @desc    Get all emergency services (supports filtering, search)
 * @route   GET /api/emergency
 * @access  Public
 */
export const getEmergencies = async (req, res) => {
  const { category, search } = req.query;

  try {
    const query = {};

    // 1. Category filter
    if (category) {
      query.category = category;
    }

    // 2. Search filter (regex name, address, or city match)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    // Return active services first, then sort alphabetically by name
    const emergencies = await Emergency.find(query).sort({ status: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    console.error(`[Emergency Controller] Fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load emergency contacts directory',
    });
  }
};
