import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide doctor specialization'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide doctor department'],
      enum: [
        'General Medicine',
        'Cardiology',
        'Pediatrics',
        'Neurology',
        'Dermatology',
        'Orthopedics',
        'Gynecology',
        'Ophthalmology'
      ],
      default: 'General Medicine',
    },
    experience: {
      type: Number,
      required: [true, 'Please provide doctor years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
      min: [0, 'Fee cannot be negative'],
    },
    about: {
      type: String,
      required: [true, 'Please provide short doctor biography'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '', // Placeholder avatar URL
    },
    availableSlots: [
      {
        day: {
          type: String,
          required: [true, 'Please specify slot day (e.g. Monday)'],
        },
        time: {
          type: String,
          required: [true, 'Please specify slot time (e.g. 10:00 AM)'],
        },
        isBooked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Create compound index for fast queries based on name & department
doctorSchema.index({ name: 'text', department: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
