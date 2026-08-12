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

/**
 * @desc    Seed mock emergency services data
 * @route   POST /api/emergency/seed
 * @access  Private/Dev
 */
export const seedEmergencies = async (req, res) => {
  const mockEmergencies = [
    {
      name: 'Edhi Ambulance Service HQ',
      category: 'Ambulance',
      contactNumber: '115',
      altContactNumber: '021-32341351',
      address: 'M.A Jinnah Road, Central Karachi',
      city: 'Karachi',
      latitude: 24.8607,
      longitude: 67.0011,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'Chhipa Ambulance Operations',
      category: 'Ambulance',
      contactNumber: '1020',
      altContactNumber: '021-111-92-1020',
      address: 'FTC Bridge, Shahrah-e-Faisal',
      city: 'Karachi',
      latitude: 24.8552,
      longitude: 67.0423,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'Aga Khan University Hospital Trauma Center',
      category: 'Trauma Center',
      contactNumber: '021-111-911-911',
      altContactNumber: '021-34861090',
      address: 'National Stadium Road, Gulshan-e-Iqbal',
      city: 'Karachi',
      latitude: 24.8922,
      longitude: 67.0747,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'Hussaini Blood Bank',
      category: 'Blood Bank',
      contactNumber: '021-32225114',
      altContactNumber: '021-32238330',
      address: 'Britto Road, Soldier Bazar',
      city: 'Karachi',
      latitude: 24.8761,
      longitude: 67.0272,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'Rescue 1122 Ambulance Station',
      category: 'Ambulance',
      contactNumber: '1122',
      altContactNumber: '042-99220220',
      address: 'Ferozepur Road, Near Kalma Chowk',
      city: 'Lahore',
      latitude: 31.5036,
      longitude: 74.3298,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'Mayo Hospital Emergency Department',
      category: 'Trauma Center',
      contactNumber: '042-99211129',
      altContactNumber: '042-99211100',
      address: 'Hospital Road, Near Anarkali Bazar',
      city: 'Lahore',
      latitude: 31.5722,
      longitude: 74.3122,
      isAvailable24_7: true,
      status: 'busy', // Marked as busy for testing card styles
    },
    {
      name: 'Shaukat Khanum Blood Collection Center',
      category: 'Blood Bank',
      contactNumber: '042-35905000',
      altContactNumber: '042-35945100',
      address: 'Johar Town, Phase 2 Block R3',
      city: 'Lahore',
      latitude: 31.4673,
      longitude: 74.2662,
      isAvailable24_7: true,
      status: 'active',
    },
    {
      name: 'National Disaster Management Helpline',
      category: 'Helpline',
      contactNumber: '1195',
      altContactNumber: '051-9205037',
      address: 'Sector G-5/1, Prime Minister Office',
      city: 'Islamabad',
      latitude: 33.7294,
      longitude: 73.0931,
      isAvailable24_7: true,
      status: 'active',
    },
  ];

  try {
    // Clean existing catalog
    await Emergency.deleteMany();
    // Bulk insert new checkups dataset
    const seeded = await Emergency.insertMany(mockEmergencies);

    res.status(201).json({
      success: true,
      message: 'Emergency services database seeded successfully!',
      count: seeded.length,
      data: seeded,
    });
  } catch (error) {
    console.error(`[Emergency Controller] Seeding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, seeding operation failed',
    });
  }
};
