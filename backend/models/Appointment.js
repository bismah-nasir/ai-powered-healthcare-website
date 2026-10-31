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
    // Calendar date of the visit (midnight UTC), copied from the slot at booking time.
    // Appointments booked before slots had dates only have `day`.
    date: {
      type: Date,
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    symptoms: {
      type: String,
      trim: true,
      maxlength: [1000, 'Symptoms cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed', // Bookings are confirmed straight away; there is no approval step
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
