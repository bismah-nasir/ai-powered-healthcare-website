import Contact from '../models/Contact.js';

/**
 * @desc    Submit a new contact support form
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    // 1. Create new contact record (triggers schema schema validations)
    const newSubmission = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newSubmission.save();

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. Our team will contact you shortly.',
      data: newSubmission,
    });
  } catch (error) {
    console.error(`[Contact Controller] Submission error: ${error.message}`);
    
    // Mongoose validation error formatting check
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error, submission failed. Please try again later.',
    });
  }
};

/**
 * @desc    Get all contact inquiries list (for Admin dashboard use)
 * @route   GET /api/contact
 * @access  Private (Admin only)
 */
export const getContactSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error(`[Contact Controller] Fetch list error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load support requests history',
    });
  }
};
