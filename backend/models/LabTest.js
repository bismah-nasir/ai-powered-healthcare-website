import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lab test name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Lab test category is required'],
      enum: {
        values: [
          'Full Body Checkup',
          'Vitamins & Minerals',
          'Heart Health',
          'Diabetes Screen',
          'Thyroid Profile',
          'Kidney & Liver',
          'Infectious Diseases',
          'Allergy Tests',
        ],
        message: '{VALUE} is not a valid lab test category',
      },
    },
    description: {
      type: String,
      required: [true, 'Lab test description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Lab test price is required'],
      min: [0, 'Price cannot be negative'],
    },
    sampleType: {
      type: String,
      required: [true, 'Sample type is required'],
      enum: ['Blood', 'Urine', 'Swab', 'Stool', 'Saliva'],
    },
    reportTime: {
      type: String,
      required: [true, 'Report turnaround time is required'],
      default: 'Reports in 24 hours',
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    preparationInstructions: {
      type: String,
      default: 'No special preparation needed.',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for name and category searches
labTestSchema.index({ name: 'text', description: 'text' });
// Normal index for fast category searches
labTestSchema.index({ category: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
