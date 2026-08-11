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

/**
 * @desc    Seed mock medicines data
 * @route   POST /api/medicines/seed
 * @access  Private/Dev
 */
export const seedMedicines = async (req, res) => {
  const mockMedicines = [
    {
      name: 'Panadol Extra',
      category: 'Pain Relief',
      manufacturer: 'GSK Consumer Healthcare',
      price: 150,
      description: 'Provides fast, effective temporary relief of pain and discomfort associated with headache, migraine, sore throat, and toothache.',
      activeIngredients: ['Paracetamol', 'Caffeine'],
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: false,
    },
    {
      name: 'Amoxil 500mg Capsule',
      category: 'Antibiotics',
      manufacturer: 'GlaxoSmithKline',
      price: 320,
      description: 'Broad-spectrum antibiotic used to treat bacterial infections of the ears, nose, throat, urinary tract, and skin.',
      activeIngredients: ['Amoxicillin'],
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: true,
    },
    {
      name: 'Fluphen-D Tablet',
      category: 'Cold & Flu',
      manufacturer: 'Abbott Laboratories',
      price: 90,
      description: 'For relief of runny nose, sneezing, watery eyes, and fever due to influenza, common colds, or allergic rhinitis.',
      activeIngredients: ['Paracetamol', 'Phenylephrine HCl', 'Chlorpheniramine'],
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: false,
    },
    {
      name: 'Centrum Adults Multivitamin',
      category: 'Vitamins',
      manufacturer: 'Pfizer Inc.',
      price: 850,
      description: 'Complete daily multivitamin formulated with essential nutrients to support energy, immunity, metabolism, and whole-body health.',
      activeIngredients: ['Vitamin A', 'Vitamin C', 'Vitamin D3', 'Vitamin E', 'Zinc'],
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: false,
    },
    {
      name: 'CeraVe Moisturizing Cream',
      category: 'Skin Care',
      manufacturer: 'L\'Oreal USA',
      price: 950,
      description: 'Dermatologist developed daily moisturizing cream containing three essential ceramides and hyaluronic acid to restore the protective skin barrier.',
      activeIngredients: ['Ceramides', 'Hyaluronic Acid'],
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: false,
    },
    {
      name: 'Gaviscon Double Action',
      category: 'Digestive Health',
      manufacturer: 'Reckitt Benckiser',
      price: 240,
      description: 'Fast, soothing, and long-lasting relief from heartburn, acid indigestion, and gastric reflux pain.',
      activeIngredients: ['Sodium Alginate', 'Sodium Bicarbonate', 'Calcium Carbonate'],
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: false,
    },
    {
      name: 'Glucophage 500mg Tablet',
      category: 'Diabetes Care',
      manufacturer: 'Merck KGaA',
      price: 180,
      description: 'Oral antidiabetic medicine prescribed for the treatment of type 2 diabetes mellitus to improve glycemic control.',
      activeIngredients: ['Metformin Hydrochloride'],
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: true,
    },
    {
      name: 'Lipitor 10mg Tablet',
      category: 'Cardiac Care',
      manufacturer: 'Viatris Inc.',
      price: 1200,
      description: 'Statin medication prescribed alongside diet modifications to lower cholesterol levels and reduce risk of cardiovascular disease.',
      activeIngredients: ['Atorvastatin Calcium'],
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
      isPrescriptionRequired: true,
    },
  ];

  try {
    // Clean existing catalog
    await Medicine.deleteMany();
    // Bulk insert new inventory dataset
    const seeded = await Medicine.insertMany(mockMedicines);

    res.status(201).json({
      success: true,
      message: 'Pharmacy database seeded successfully!',
      count: seeded.length,
      data: seeded,
    });
  } catch (error) {
    console.error(`[Medicine Controller] Seeding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, seeding operation failed',
    });
  }
};
