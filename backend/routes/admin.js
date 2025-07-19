const express = require('express');
const { query, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard-metrics
// @desc    Get dashboard metrics
// @access  Private (Admin only)
router.get('/dashboard-metrics', async (req, res) => {
  try {
    // Get basic metrics
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const totalUsers = await User.countDocuments({ role: 'member' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalComments = await Comment.countDocuments({ isApproved: true });
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    // Get total views and likes
    const viewsResult = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    const likesResult = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    // Get posts created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const postsThisMonth = await Post.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get comments this month
    const commentsThisMonth = await Comment.countDocuments({
      createdAt: { $gte: startOfMonth },
      isApproved: true
    });

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalAdmins,
      totalComments,
      pendingComments,
      totalViews,
      totalLikes,
      postsThisMonth,
      commentsThisMonth
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/tag-insights
// @desc    Get tag distribution data for charts
// @access  Private (Admin only)
router.get('/tag-insights', async (req, res) => {
  try {
    const tags = await Tag.find({ postCount: { $gt: 0 } })
      .select('name postCount color')
      .sort({ postCount: -1 })
      .limit(10)
      .lean();

    res.json({ tags });
  } catch (error) {
    console.error('Tag insights error:', error);
    res.status(500).json({
      message: 'Failed to fetch tag insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/admin/top-posts
// @desc    Get most popular posts by views/likes
// @access  Private (Admin only)
router.get('/top-posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sort || 'views'; // 'views' or 'likes'

    const sortField = sortBy === 'likes' ? 'likeCount' : 'viewCount';

    const topPosts = await Post.find({ status: 'published' })
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
router.get('/recent-comments', async (req, res) => {
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
// @desc    Get all posts for admin (published and draft)
// @access  Private (Admin only)
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

      // Build query
      let query = {};
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

// @route   GET /api/admin/comments
// @desc    Get all comments for admin management
// @access  Private (Admin only)
router.get('/comments',
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

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('role').optional().isIn(['member', 'admin', 'all']).withMessage('Invalid role filter')
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

// @route   GET /api/admin/analytics
// @desc    Get analytics data (posts, views, comments over time)
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
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

// @route   PUT /api/admin/users/:userId/status
// @desc    Activate/deactivate user account
// @access  Private (Admin only)
router.put('/users/:userId/status', async (req, res) => {
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

module.exports = router;
