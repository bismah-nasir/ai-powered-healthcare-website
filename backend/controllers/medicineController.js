import Medicine from '../models/Medicine.js';

/**
 * @desc    Get all medicines (supports filtering, search)
 * @route   GET /api/medicines
 * @access  Public
 */
export const getMedicines = async (req, res) => {
  const { category, search } = req.query;

  try {
    const query = {};

    // 1. Category filter
    if (category) {
      query.category = category;
    }

    // 2. Search filter (text index query or case-insensitive regex name match)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { activeIngredients: { $regex: search, $options: 'i' } },
      ];
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error(`[Medicine Controller] Fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load medicines directory',
    });
  }
};

/**
 * @desc    Get single medicine details
 * @route   GET /api/medicines/:id
 * @access  Public
 */
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error(`[Medicine Controller] ID lookup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, invalid medicine ID format',
    });
  }
};
