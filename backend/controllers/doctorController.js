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

/**
 * @desc    Seed mock doctors into DB (Development Utility)
 * @route   POST /api/doctors/seed
 * @access  Public
 */
export const seedDoctors = async (req, res) => {
  // Array of realistic doctor profiles with categories and slots
  const mockDoctors = [
    {
      name: 'Dr. Sarah Connor',
      specialization: 'Senior Consultant Cardiologist',
      department: 'Cardiology',
      experience: 14,
      rating: 4.9,
      reviewsCount: 124,
      consultationFee: 1500,
      about: 'Dr. Sarah is an expert in preventive cardiology, cardiovascular diagnostics, and heart disease management with over 14 years of practice.',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Monday', time: '09:00 AM' },
        { day: 'Monday', time: '11:00 AM' },
        { day: 'Wednesday', time: '03:00 PM' }
      ]
    },
    {
      name: 'Dr. John Miller',
      specialization: 'Pediatric Care Specialist',
      department: 'Pediatrics',
      experience: 8,
      rating: 4.8,
      reviewsCount: 92,
      consultationFee: 1000,
      about: 'Dr. John specializes in child health, vaccinations, growth development monitoring, and infant dietary planning.',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Tuesday', time: '10:00 AM' },
        { day: 'Thursday', time: '02:00 PM' },
        { day: 'Thursday', time: '04:00 PM' }
      ]
    },
    {
      name: 'Dr. Elena Rostova',
      specialization: 'Clinical Neurologist & Brain Expert',
      department: 'Neurology',
      experience: 16,
      rating: 5.0,
      reviewsCount: 156,
      consultationFee: 2000,
      about: 'Dr. Elena specializes in the diagnosis and management of brain disorders, chronic migraines, sleep conditions, and cognitive health.',
      imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Wednesday', time: '10:00 AM' },
        { day: 'Friday', time: '09:00 AM' }
      ]
    },
    {
      name: 'Dr. David Kim',
      specialization: 'Dermatologist & Skin Care Expert',
      department: 'Dermatology',
      experience: 10,
      rating: 4.7,
      reviewsCount: 78,
      consultationFee: 1200,
      about: 'Dr. David specializes in clinical dermatology, skin cancer screenings, acne treatments, and advanced skin care therapy.',
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Monday', time: '02:00 PM' },
        { day: 'Tuesday', time: '04:00 PM' }
      ]
    },
    {
      name: 'Dr. Alan Vance',
      specialization: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      experience: 12,
      rating: 4.6,
      reviewsCount: 84,
      consultationFee: 1500,
      about: 'Dr. Alan focuses on bone health, joint reconstruction surgery, sports injuries recovery, and spinal management.',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Thursday', time: '09:00 AM' },
        { day: 'Friday', time: '11:00 AM' }
      ]
    },
    {
      name: 'Dr. Lisa Wong',
      specialization: 'Family Medicine Consultant',
      department: 'General Medicine',
      experience: 9,
      rating: 4.9,
      reviewsCount: 110,
      consultationFee: 800,
      about: 'Dr. Lisa provides comprehensive primary care, annual health checkups, chronic disease management, and preventative counselling.',
      imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
      availableSlots: [
        { day: 'Monday', time: '10:00 AM' },
        { day: 'Wednesday', time: '11:00 AM' },
        { day: 'Friday', time: '03:00 PM' }
      ]
    }
  ];

  try {
    // Clear existing doctors first to avoid duplicates
    await Doctor.deleteMany();
    
    // Seed new doctor records
    const doctors = await Doctor.insertMany(mockDoctors);

    res.status(201).json({
      success: true,
      message: 'Database seeded with test doctor profiles successfully!',
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(`[Doctor Controller] Seeding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, seeding failed',
    });
  }
};
