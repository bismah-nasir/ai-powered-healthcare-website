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

/**
 * @desc    Seed mock lab tests data
 * @route   POST /api/labs/seed
 * @access  Private/Dev
 */
export const seedLabTests = async (req, res) => {
  const mockLabTests = [
    {
      name: 'Complete Blood Count (CBC)',
      category: 'Full Body Checkup',
      description: 'Evaluates overall health and detects a wide range of disorders, including anemia, infection, and leukemia. Measures red blood cells, white blood cells, platelets, and hemoglobin.',
      price: 450,
      sampleType: 'Blood',
      reportTime: 'Reports in 12 hours',
      fastingRequired: false,
      preparationInstructions: 'No fasting required. Avoid heavy fat meals before blood collection.',
    },
    {
      name: 'Lipid Profile (Cholesterol Check)',
      category: 'Heart Health',
      description: 'Measures total cholesterol, LDL (bad cholesterol), HDL (good cholesterol), and triglycerides to assess cardiovascular risk and heart health.',
      price: 600,
      sampleType: 'Blood',
      reportTime: 'Reports in 24 hours',
      fastingRequired: true,
      preparationInstructions: 'Fasting required for 10-12 hours. Drink only water during fasting.',
    },
    {
      name: 'HbA1c (Glycated Hemoglobin)',
      category: 'Diabetes Screen',
      description: 'Measures average blood sugar levels over the past 2 to 3 months. Essential for diagnosing and monitoring type 1 and type 2 diabetes.',
      price: 550,
      sampleType: 'Blood',
      reportTime: 'Reports in 12 hours',
      fastingRequired: false,
      preparationInstructions: 'No fasting required. Can be done at any time of the day.',
    },
    {
      name: 'Thyroid Profile (T3, T4, TSH)',
      category: 'Thyroid Profile',
      description: 'Comprehensive screening to evaluate thyroid hormone levels and diagnose thyroid disorders like hypothyroidism or hyperthyroidism.',
      price: 750,
      sampleType: 'Blood',
      reportTime: 'Reports in 24 hours',
      fastingRequired: false,
      preparationInstructions: 'No fasting required. It is recommended to perform this test in the morning.',
    },
    {
      name: 'Liver Function Test (LFT)',
      category: 'Kidney & Liver',
      description: 'Measures proteins, liver enzymes, and bilirubin levels in the blood to diagnose liver infections, scarring, and monitor medication side effects.',
      price: 900,
      sampleType: 'Blood',
      reportTime: 'Reports in 24 hours',
      fastingRequired: true,
      preparationInstructions: 'Fasting required for 8-10 hours. Avoid alcohol consumption for 24 hours before test.',
    },
    {
      name: 'Active Vitamin D (25-Hydroxy)',
      category: 'Vitamins & Minerals',
      description: 'Measures bone wellness and identifies deficiencies in Vitamin D which is essential for calcium absorption, bone strength, and immune support.',
      price: 1200,
      sampleType: 'Blood',
      reportTime: 'Reports in 24 hours',
      fastingRequired: false,
      preparationInstructions: 'No fasting required. Stop vitamin supplements for 24 hours prior to blood collection.',
    },
    {
      name: 'Urine Routine & Examination',
      category: 'Kidney & Liver',
      description: 'Urinanalysis screening to detect urinary tract infections (UTI), kidney health parameters, and early signs of diabetes.',
      price: 250,
      sampleType: 'Urine',
      reportTime: 'Reports in 12 hours',
      fastingRequired: false,
      preparationInstructions: 'Provide the first morning urine sample in a sterile container.',
    },
    {
      name: 'Allergy Screening (Food & Inhalants)',
      category: 'Allergy Tests',
      description: 'Identifies antibodies to standard food items (gluten, dairy, nuts) and inhalants (pollen, dust, mold) that trigger allergic reactions.',
      price: 2500,
      sampleType: 'Blood',
      reportTime: 'Reports in 48 hours',
      fastingRequired: false,
      preparationInstructions: 'No fasting required. Avoid anti-allergic antihistamine medications for 48 hours.',
    },
  ];

  try {
    // Clean existing catalog
    await LabTest.deleteMany();
    // Bulk insert new checkups dataset
    const seeded = await LabTest.insertMany(mockLabTests);

    res.status(201).json({
      success: true,
      message: 'Lab tests database seeded successfully!',
      count: seeded.length,
      data: seeded,
    });
  } catch (error) {
    console.error(`[LabTest Controller] Seeding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, seeding operation failed',
    });
  }
};
