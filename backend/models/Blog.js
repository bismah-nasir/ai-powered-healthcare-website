import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content body is required'],
      trim: true,
    },
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
      },
      title: {
        type: String,
        required: [true, 'Author clinical title is required'],
        trim: true,
      },
      imageUrl: {
        type: String,
        default: '',
      },
    },
    category: {
      type: String,
      required: [true, 'Blog category is required'],
      enum: {
        values: ['Nutrition', 'Mental Health', 'Exercise', 'Cardiology', 'General Wellness'],
        message: '{VALUE} is not a valid blog category',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      required: [true, 'Read time estimate is required'],
      default: '5 min read',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for title, content, and tag searches
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
// Normal index for fast category filters
blogSchema.index({ category: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
