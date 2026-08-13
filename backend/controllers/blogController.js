import Blog from '../models/Blog.js';

/**
 * @desc    Get all blog articles (supports filtering, search)
 * @route   GET /api/blogs
 * @access  Public
 */
export const getBlogs = async (req, res) => {
  const { category, tag, search } = req.query;

  try {
    const query = {};

    // 1. Category filter
    if (category) {
      query.category = category;
    }

    // 2. Tag filter (match tag in array)
    if (tag) {
      query.tags = tag;
    }

    // 3. Search filter (regex title, content, or tag match)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Return newest articles first
    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error(`[Blog Controller] Fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not load articles directory',
    });
  }
};

/**
 * @desc    Get single blog article details
 * @route   GET /api/blogs/:id
 * @access  Public
 */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error(`[Blog Controller] ID lookup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, invalid blog ID format',
    });
  }
};
