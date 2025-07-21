const express = require('express');
const { query, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes, but not admin requirement (will be added per route)
router.use(authenticateToken);

// @route   GET /api/admin/dashboard-metrics
// @desc    Get user's personal dashboard metrics
// @access  Private (Any authenticated user)
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's post statistics
    const totalPosts = await Post.countDocuments({ author: userId });
    const publishedPosts = await Post.countDocuments({ 
      author: userId, 
      status: 'published' 
    });
    const draftPosts = await Post.countDocuments({ 
      author: userId, 
      status: 'draft' 
    });

    // Get total views and likes for user's posts
    const viewsResult = await Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    const likesResult = await Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    // Get comments on user's posts
    const userPostIds = await Post.find({ author: userId }).select('_id');
    const postIds = userPostIds.map(post => post._id);
    
    const totalComments = await Comment.countDocuments({ 
      post: { $in: postIds }, 
      isApproved: true 
    });
    const pendingComments = await Comment.countDocuments({ 
      post: { $in: postIds }, 
      isApproved: false 
    });

    // Get posts created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const postsThisMonth = await Post.countDocuments({
      author: userId,
      createdAt: { $gte: startOfMonth }
    });

    // Get comments this month on user's posts
    const commentsThisMonth = await Comment.countDocuments({
      post: { $in: postIds },
      createdAt: { $gte: startOfMonth },
      isApproved: true
    });

    // Calculate averages
    const avgViews = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;
    const avgLikes = publishedPosts > 0 ? Math.round(totalLikes / publishedPosts) : 0;

    // For user dashboard, we show personal stats, not system stats
    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers: 1, // Just the current user
      totalAdmins: req.user.role === 'admin' ? 1 : 0, // Just current user if admin
      totalComments,
      pendingComments,
      totalViews,
      totalLikes,
      postsThisMonth,
      commentsThisMonth,
      avgViews,
      avgLikes
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/system-metrics
// @desc    Get system-wide metrics for admin control panel
// @access  Private (Admin only)
router.get('/system-metrics', requireAdmin, async (req, res) => {
  try {
    // Get total users by role
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const superAdminUsers = await User.countDocuments({ role: 'super_admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    
    // Get new users this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Calculate system uptime (process uptime in seconds)
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const systemUptime = `${uptimeHours}h ${uptimeMinutes}m`;
    
    // Get database size estimates
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalTags = await Tag.countDocuments();
    
    // Rough database size estimate (this is a simplified calculation)
    const estimatedDbSize = `${Math.round((totalUsers * 1 + totalPosts * 5 + totalComments * 2 + totalTags * 0.1) / 1024)} MB`;
    const estimatedStorageUsed = `${Math.round((totalPosts * 0.5) / 1024)} GB`; // Rough estimate for media files
    
    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      superAdminUsers,
      moderatorUsers,
      newUsersThisMonth,
      systemUptime,
      databaseSize: estimatedDbSize,
      storageUsed: estimatedStorageUsed
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      message: 'Failed to fetch system metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users',
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('role').optional().isIn(['user', 'admin', 'moderator', 'super_admin', 'all']).withMessage('Invalid role filter')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const role = req.query.role || 'all';

      // Build query
      let query = {};
      if (role !== 'all') {
        query.role = role;
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        users,
        totalUsers,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/admin/tag-insights
// @desc    Get user's tag distribution data for charts
// @access  Private (Any authenticated user)
router.get('/tag-insights', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get tags used in user's posts with their counts
    const tagDistribution = await Post.aggregate([
      { $match: { author: userId } },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags',
          count: { $sum: 1 }
        } 
      },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tagInfo'
        }
      },
      { $unwind: '$tagInfo' },
      {
        $project: {
          name: '$tagInfo.name',
          color: '$tagInfo.color',
          postCount: '$count',
          count: '$count'
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ tags: tagDistribution });
  } catch (error) {
    console.error('Tag insights error:', error);
    res.status(500).json({
      message: 'Failed to fetch tag insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/top-posts
// @desc    Get user's most popular posts by views/likes
// @access  Private (Any authenticated user)
router.get('/top-posts', async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sort || 'views'; // 'views' or 'likes'

    const sortField = sortBy === 'likes' ? 'likeCount' : 'viewCount';

    const topPosts = await Post.find({ 
      author: userId, 
      status: 'published' 
    })
      .select('title slug viewCount likeCount commentCount publishedAt coverImage')
      .populate('author', 'name')
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean();

    res.json({ posts: topPosts });
  } catch (error) {
    console.error('Top posts error:', error);
    res.status(500).json({
      message: 'Failed to fetch top posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/recent-comments
// @desc    Get recent comments for admin dashboard
// @access  Private (Admin only)
router.get('/recent-comments', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentComments = await Comment.find({ isApproved: true })
      .populate('author', 'name profileImage')
      .populate('post', 'title slug')
      .select('content createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ comments: recentComments });
  } catch (error) {
    console.error('Recent comments error:', error);
    res.status(500).json({
      message: 'Failed to fetch recent comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/posts
// @desc    Get posts (for admins: all posts, for users: their own posts)
// @access  Private (Any authenticated user)
router.get('/posts',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['published', 'draft', 'all']).withMessage('Invalid status filter')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const status = req.query.status || 'all';

      // Build query - only super_admins see all posts, admins and users see only their own
      let query = {};
      if (req.user.role !== 'super_admin') {
        query.author = req.user._id;
      }
      if (status !== 'all') {
        query.status = status;
      }

      const posts = await Post.find(query)
        .populate('author', 'name profileImage')
        .populate('tags', 'name slug color')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalPosts = await Post.countDocuments(query);
      const totalPages = Math.ceil(totalPosts / limit);

      res.json({
        posts,
        totalPosts,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
    } catch (error) {
      console.error('Admin get posts error:', error);
      res.status(500).json({
        message: 'Failed to fetch posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/admin/posts/:id
// @desc    Get single post for editing
// @access  Private (Any authenticated user)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'name profileImage email')
      .populate('tags', 'name slug color')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only super_admins can edit any post, admins and users can only edit their own posts
    if (req.user.role !== 'super_admin' && post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Admin get single post error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({
      message: 'Failed to fetch post',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/comments
// @desc    Get all comments for admin management
// @access  Private (Admin only)
router.get('/comments',
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('approved').optional().isBoolean().withMessage('Approved must be a boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const approved = req.query.approved;

      // Build query
      let query = {};
      if (approved !== undefined) {
        query.isApproved = approved === 'true';
      }

      const comments = await Comment.find(query)
        .populate('author', 'name profileImage email')
        .populate('post', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalComments = await Comment.countDocuments(query);
      const totalPages = Math.ceil(totalComments / limit);

      res.json({
        comments,
        totalComments,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
    } catch (error) {
      console.error('Admin get comments error:', error);
      res.status(500).json({
        message: 'Failed to fetch comments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/admin/analytics
// @desc    Get analytics data (posts, views, comments over time)
// @access  Private (Admin only)
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Posts over time
    const postsOverTime = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Comments over time
    const commentsOverTime = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isApproved: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Views by post (top 10)
    const topViewedPosts = await Post.find({ status: 'published' })
      .select('title viewCount')
      .sort({ viewCount: -1 })
      .limit(10)
      .lean();

    res.json({
      postsOverTime,
      commentsOverTime,
      topViewedPosts,
      period: days
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Additional admin methods for user management
router.put('/users/:userId/status', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean value'
      });
    }

    // Prevent admin from deactivating their own account
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting their own account
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.put('/users/:userId/role', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator', 'super_admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be user, admin, moderator, or super_admin'
      });
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/users/bulk-action', requireAdmin, async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: 'userIds must be a non-empty array'
      });
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be activate, deactivate, or delete'
      });
    }

    // Prevent admin from acting on their own account
    if (userIds.includes(req.user._id.toString())) {
      return res.status(400).json({
        message: 'You cannot perform bulk actions on your own account'
      });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Bulk user action error:', error);
    res.status(500).json({
      message: 'Failed to perform bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    if (!['user', 'admin', 'moderator', 'super_admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be user, admin, moderator, or super_admin'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the User model
      role,
      isActive: true
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
