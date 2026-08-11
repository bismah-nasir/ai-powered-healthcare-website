import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Medicine category is required'],
      enum: {
        values: [
          'Pain Relief',
          'Antibiotics',
          'Cold & Flu',
          'Vitamins',
          'Skin Care',
          'Digestive Health',
          'Diabetes Care',
          'Cardiac Care',
        ],
        message: '{VALUE} is not a valid medicine category',
      },
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer details are required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Medicine price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Medicine description is required'],
      trim: true,
    },
    activeIngredients: {
      type: [String],
      required: [true, 'Active ingredients are required'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock level is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for name and active ingredient searches
medicineSchema.index({ name: 'text', activeIngredients: 'text' });
// Normal index for fast category lookups
medicineSchema.index({ category: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
