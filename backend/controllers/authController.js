import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // 3. Create new user (password is hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error(`[Auth Controller] Register error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, registration failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // 2. Fetch user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Compare passwords using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error(`[Auth Controller] Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, login failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user profile details
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }
  } catch (error) {
    console.error(`[Auth Controller] Get Profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not fetch profile',
    });
  }
};

/**
 * @desc    Forgot Password (Nodemailer handler)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address',
      });
    }

    // 1. Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token and save to User schema fields with 10 minute expiry
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // 3. Create reset URL pointing to frontend router page
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 4. Draft email HTML template
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #00b4a2; text-align: center;">PulseCare AI</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your PulseCare AI portal account. Please click the button below to reset your password. This link is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #00b4a2; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #718096;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="font-size: 11px; color: #a0aec0; text-align: center;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    try {
      const info = await sendEmail({
        email: user.email,
        subject: 'PulseCare AI - Password Reset Request',
        message,
      });

      res.status(200).json({
        success: true,
        message: `Password reset instructions sent to ${email}.`,
        previewUrl: info.previewUrl || null, // returns Ethereal URL if dynamically generated
      });
    } catch (mailError) {
      console.error(`[Auth Controller] Email send failed: ${mailError.message}`);
      // Clear token columns if email send fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    console.error(`[Auth Controller] Forgot Password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not process request',
    });
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password',
      });
    }

    // 1. Hash incoming token to match with saved database hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Search for active, non-expired token in DB
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password recovery token.',
      });
    }

    // 3. Set new password (will be hashed automatically by User schema pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in.',
    });
  } catch (error) {
    console.error(`[Auth Controller] Reset Password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, password reset failed',
    });
  }
};
