const express = require('express');
const { query, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/dashboard/my-stats
// @desc    Get user's personal dashboard metrics
// @access  Private (Any authenticated user)
router.get('/my-stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let authorFilter = { author: userId };

    if (userRole === 'super_admin') {
      // Fetch all admin and super_admin user IDs
      const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } }).select('_id');
      const adminIds = adminUsers.map(user => user._id);
      authorFilter = { author: { $in: adminIds } };
    }

    // Get user's or admins' post statistics
    const totalPosts = await Post.countDocuments(authorFilter);
    const publishedPosts = await Post.countDocuments({
      ...authorFilter,
      status: 'published'
    });
    const draftPosts = await Post.countDocuments({
      ...authorFilter,
      status: 'draft'
    });

    // Get total views and likes for user's or admins' posts
    const viewsResult = await Post.aggregate([
      { $match: { ...authorFilter, status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    const likesResult = await Post.aggregate([
      { $match: { ...authorFilter, status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
    ]);
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    // Get comments on user's or admins' posts
    const userPostIds = await Post.find(authorFilter).select('_id');
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
      ...authorFilter,
      createdAt: { $gte: startOfMonth }
    });

    // Get comments this month on user's or admins' posts
    const commentsThisMonth = await Comment.countDocuments({
      post: { $in: postIds },
      createdAt: { $gte: startOfMonth },
      isApproved: true
    });

    // Average views per post
    const avgViews = totalPosts > 0 ? Math.round(totalViews / publishedPosts) || 0 : 0;

    // Average likes per post
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / publishedPosts) || 0 : 0;

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      totalComments,
      pendingComments,
      postsThisMonth,
      commentsThisMonth,
      avgViews,
      avgLikes
    });
  } catch (error) {
    console.error('User dashboard metrics error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/my-tag-distribution
// @desc    Get tag distribution for user's posts
// @access  Private (Any authenticated user)
router.get('/my-tag-distribution', async (req, res) => {
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
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ tags: tagDistribution });
  } catch (error) {
    console.error('User tag distribution error:', error);
    res.status(500).json({
      message: 'Failed to fetch tag distribution',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/my-top-posts
// @desc    Get user's most popular posts by views/likes
// @access  Private (Any authenticated user)
router.get('/my-top-posts', async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const sortBy = req.query.sort || 'views'; // 'views' or 'likes'

    const sortField = sortBy === 'likes' ? 'likeCount' : 'viewCount';

    const topPosts = await Post.find({ 
      author: userId, 
      status: 'published' 
    })
      .select('title slug viewCount likeCount commentCount publishedAt coverImage')
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean();

    res.json({ posts: topPosts });
  } catch (error) {
    console.error('User top posts error:', error);
    res.status(500).json({
      message: 'Failed to fetch top posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/my-recent-comments
// @desc    Get recent comments on user's posts
// @access  Private (Any authenticated user)
router.get('/my-recent-comments', async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's post IDs
    const userPostIds = await Post.find({ author: userId }).select('_id');
    const postIds = userPostIds.map(post => post._id);

    const recentComments = await Comment.find({ 
      post: { $in: postIds }, 
      isApproved: true 
    })
      .populate('author', 'name profileImage')
      .populate('post', 'title slug')
      .select('content createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ comments: recentComments });
  } catch (error) {
    console.error('User recent comments error:', error);
    res.status(500).json({
      message: 'Failed to fetch recent comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/my-posts
// @desc    Get user's posts with pagination
// @access  Private (Any authenticated user)
router.get('/my-posts',
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

      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const status = req.query.status || 'all';

      // Build query - only user's posts
      let query = { author: userId };
      if (status !== 'all') {
        query.status = status;
      }

      const posts = await Post.find(query)
        .populate('tags', 'name slug color')
        .select('title slug status viewCount likeCount commentCount createdAt updatedAt publishedAt coverImage excerpt')
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
      console.error('User get posts error:', error);
      res.status(500).json({
        message: 'Failed to fetch posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/dashboard/my-analytics
// @desc    Get user's analytics data (posts, views, comments over time)
// @access  Private (Any authenticated user)
router.get('/my-analytics', async (req, res) => {
  try {
    const userId = req.user._id;
    const period = req.query.period || '30'; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Posts over time for user
    const postsOverTime = await Post.aggregate([
      {
        $match: {
          author: userId,
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

    // Get user's post IDs for comment analytics
    const userPostIds = await Post.find({ author: userId }).select('_id');
    const postIds = userPostIds.map(post => post._id);

    // Comments over time on user's posts
    const commentsOverTime = await Comment.aggregate([
      {
        $match: {
          post: { $in: postIds },
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

    // Views over time (if we track view dates, otherwise just current view counts)
    const viewsByPost = await Post.find({ 
      author: userId, 
      status: 'published' 
    })
      .select('title viewCount likeCount')
      .sort({ viewCount: -1 })
      .limit(10)
      .lean();

    res.json({
      postsOverTime,
      commentsOverTime,
      viewsByPost,
      period: days
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
