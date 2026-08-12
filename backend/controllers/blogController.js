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

/**
 * @desc    Seed mock blog articles data
 * @route   POST /api/blogs/seed
 * @access  Private/Dev
 */
export const seedBlogs = async (req, res) => {
  const mockBlogs = [
    {
      title: '10 Heart-Healthy Superfoods to Add to Your Diet',
      category: 'Nutrition',
      tags: ['diet', 'heart', 'cholesterol', 'wellness'],
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600',
      content: 'Maintaining a healthy heart starts with the food on your plate. Incorporating nutrient-dense superfoods can help lower blood pressure, reduce bad cholesterol, and prevent arterial inflammation. Key superfoods include: 1. Salmon and Fatty Fish (rich in Omega-3), 2. Blueberries and Strawberries (high in antioxidants), 3. Oats and Barley (full of soluble fiber), 4. Avocados (monounsaturated fats), and 5. Dark Chocolate (flavanols). Eating a colorful variety of these items supports cardiac wellness.',
      author: {
        name: 'Dr. Sarah Connor',
        title: 'Senior Consultant Cardiologist',
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      },
    },
    {
      title: 'Managing Anxiety: 5 Mindfulness Techniques that Work',
      category: 'Mental Health',
      tags: ['anxiety', 'mindfulness', 'meditation', 'stress'],
      readTime: '5 min read',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      content: 'Anxiety is a natural response to stress, but when it becomes chronic, it can impact your quality of life. Mindfulness practices help ground you in the present moment, breaking the cycle of worry. Try these five daily techniques: 1. The 4-7-8 Breathing Method, 2. The 5-4-3-2-1 Sensory Grounding Technique, 3. Guided Body Scan Meditation, 4. Mindful Walking, and 5. Journaling your worries to release them. Just 10 minutes a day can lower cortisol levels and restore mental clarity.',
      author: {
        name: 'Dr. Elena Rostova',
        title: 'Clinical Neurologist & Brain Expert',
        imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
      },
    },
    {
      title: 'The Ultimate Guide to a Productive Morning Workout',
      category: 'Exercise',
      tags: ['workout', 'fitness', 'morning-routine', 'energy'],
      readTime: '4 min read',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
      content: 'Exercising in the morning boosts your metabolism, enhances focus, and keeps your energy levels high all day. Designing the right routine is key to avoiding injury and maintaining consistency: 1. Dynamic Warm-up (5 minutes to increase heart rate), 2. HIIT or Strength Circuit (20 minutes of bodyweight squats, push-ups, and planks), 3. Proper Hydration (drink water before, during, and after), and 4. Nutritious Breakfast (protein and complex carbs). Start tomorrow!',
      author: {
        name: 'Dr. Alan Vance',
        title: 'Orthopedic Surgeon & Fitness Coach',
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      },
    },
    {
      title: 'Understanding Diabetes: Symptoms, Prevention, and Control',
      category: 'Diabetes Screen', // Maps to General Wellness category in UI enum
      tags: ['diabetes', 'sugar', 'insulin', 'prevention'],
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      content: 'Diabetes is a metabolic condition characterized by high blood glucose levels. Type 2 diabetes is often preventable and manageable through lifestyle changes. Early signs include increased thirst, frequent urination, fatigue, and blurry vision. Prevention strategies focus on: 1. Reducing refined sugar consumption, 2. Increasing daily physical activity, 3. Monitoring weight indexes, and 4. Annual HbA1c screening. Regular checkups protect your body.',
      author: {
        name: 'Dr. Lisa Wong',
        title: 'Family Medicine Consultant',
        imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=150',
      },
    },
  ];

  try {
    // Clean existing catalog
    await Blog.deleteMany();
    
    // Modify category on the fly to match enum constraints (since 'Diabetes Screen' is not in Blog categories enums, we map it to General Wellness)
    const normalizedBlogs = mockBlogs.map(blog => ({
      ...blog,
      category: blog.category === 'Diabetes Screen' ? 'General Wellness' : blog.category
    }));

    // Bulk insert new blogs dataset
    const seeded = await Blog.insertMany(normalizedBlogs);

    res.status(201).json({
      success: true,
      message: 'Health blogs database seeded successfully!',
      count: seeded.length,
      data: seeded,
    });
  } catch (error) {
    console.error(`[Blog Controller] Seeding error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, seeding operation failed',
    });
  }
};
