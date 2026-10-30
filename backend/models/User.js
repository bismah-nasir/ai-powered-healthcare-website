import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import emailRegex from '../utils/emailRegex.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        emailRegex,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from returning in queries by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['patient', 'admin'],
      default: 'patient',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Login tokens issued before this moment are rejected, so a password change logs out old sessions
    passwordChangedAt: Date,
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Pre-save middleware to hash password before writing to MongoDB
userSchema.pre('save', async function () {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // A new account has no older sessions to revoke
  if (!this.isNew) {
    this.passwordChangedAt = Date.now();
  }
});

// True when the token was issued before the last password change (iat is in seconds)
userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
  if (!this.passwordChangedAt) {
    return false;
  }
  return tokenIssuedAt < Math.floor(this.passwordChangedAt.getTime() / 1000);
};

// Custom instance method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
