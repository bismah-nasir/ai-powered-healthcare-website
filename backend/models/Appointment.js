import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must belong to a patient/user'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Appointment must reference a doctor'],
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Appointment must reference a specific slot ID'],
    },
    day: {
      type: String,
      required: [true, 'Appointment day is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    symptoms: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed', // Standard auto-confirm for demo dashboard convenience
    },
    consultationFee: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Indexes for fast query sorting by patient ID or doctor ID
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ doctor: 1, createdAt: -1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
