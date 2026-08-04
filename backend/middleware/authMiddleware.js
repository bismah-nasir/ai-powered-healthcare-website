import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer string: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify signature using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB using decoded token ID, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User associated with this token no longer exists.',
        });
      }

      // Proceed to the next middleware/controller
      next();
    } catch (error) {
      console.error(`[Auth Middleware] Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired.',
      });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.',
    });
  }
};

// Admin access only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied, administrator privileges required.',
    });
  }
};
