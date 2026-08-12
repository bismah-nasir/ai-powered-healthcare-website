import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Emergency service or facility name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Emergency category is required'],
      enum: {
        values: ['Ambulance', 'Blood Bank', 'Trauma Center', 'Helpline'],
        message: '{VALUE} is not a valid emergency category',
      },
    },
    contactNumber: {
      type: String,
      required: [true, 'Primary contact number is required'],
      trim: true,
    },
    altContactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City location is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    isAvailable24_7: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'busy', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes by name, address, or city
emergencySchema.index({ name: 'text', address: 'text', city: 'text' });
// Normal index for fast category lookups
emergencySchema.index({ category: 1 });

const Emergency = mongoose.model('Emergency', emergencySchema);

export default Emergency;
