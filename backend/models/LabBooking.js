import mongoose from 'mongoose';

const labBookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lab booking must belong to a patient/user'],
    },
    labTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: [true, 'Lab booking must reference a lab test'],
    },
    // Test name and price are copied at booking time so later catalog edits don't change past bookings
    testName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Patient name must be at least 2 characters'],
      maxlength: [50, 'Patient name cannot exceed 50 characters'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      maxlength: [20, 'Contact phone number cannot exceed 20 characters'],
    },
    // Calendar day of sample collection, stored as midnight UTC of that day
    collectionDate: {
      type: Date,
      required: [true, 'Sample collection date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample-collected', 'completed', 'cancelled'],
      default: 'confirmed', // Auto-confirm, matching appointments
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history listings and admin status queries
labBookingSchema.index({ patient: 1, createdAt: -1 });
labBookingSchema.index({ status: 1 });

const LabBooking = mongoose.model('LabBooking', labBookingSchema);

export default LabBooking;
