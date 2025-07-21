const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and super admin requirement to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// @route   GET /api/superadmin/system-metrics
// @desc    Get comprehensive system metrics (super admin only)
// @access  Private (Super Admin only)
router.get('/system-metrics', async (req, res) => {
  try {
    // Get all metrics including sensitive data
    const [
      totalUsers,
      totalAdmins,
      totalSuperAdmins,
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
      totalComments,
      approvedComments,
      pendingComments,
      totalTags,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super_admin' }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ featured: true }),
      Comment.countDocuments(),
      Comment.countDocuments({ isApproved: true }),
      Comment.countDocuments({ isApproved: false }),
      Tag.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    // Get total views and likes across the entire system
    const [viewsResult, likesResult, readingTimeResult] = await Promise.all([
      Post.aggregate([{ $group: { _id: null, totalViews: { $sum: '$viewCount' } } }]),
      Post.aggregate([{ $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }]),
      Post.aggregate([{ $group: { _id: null, totalReadingTime: { $sum: '$readingTime' } } }])
    ]);
    
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;
    const totalReadingTime = readingTimeResult.length > 0 ? readingTimeResult[0].totalReadingTime : 0;

    // Get recent activity stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last3Months = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      newUsersToday,
      newPostsToday,
      newCommentsToday,
      newUsersThisWeek,
      newPostsThisWeek,
      newCommentsThisWeek,
      newUsersThisMonth,
      newPostsThisMonth,
      newCommentsThisMonth,
      newUsersLast3Months,
      newPostsLast3Months,
      newCommentsLast3Months
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: today } }),
      Post.countDocuments({ createdAt: { $gte: today } }),
      Comment.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      Post.countDocuments({ createdAt: { $gte: lastWeek } }),
      Comment.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      Post.countDocuments({ createdAt: { $gte: lastMonth } }),
      Comment.countDocuments({ createdAt: { $gte: lastMonth } }),
      User.countDocuments({ createdAt: { $gte: last3Months } }),
      Post.countDocuments({ createdAt: { $gte: last3Months } }),
      Comment.countDocuments({ createdAt: { $gte: last3Months } })
    ]);

    // Get engagement metrics
    const [mostViewedPosts, mostLikedPosts, mostActiveUsers] = await Promise.all([
      Post.find({ status: 'published' })
        .select('title viewCount slug author')
        .populate('author', 'name')
        .sort({ viewCount: -1 })
        .limit(5)
        .lean(),
      Post.find({ status: 'published' })
        .select('title likeCount slug author')
        .populate('author', 'name')
        .sort({ likeCount: -1 })
        .limit(5)
        .lean(),
      Post.aggregate([
        { $match: { status: 'published' } },
        { $group: { 
          _id: '$author', 
          postCount: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: '$likeCount' }
        }},
        { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }},
        { $unwind: '$user' },
        { $project: {
          name: '$user.name',
          email: '$user.email',
          postCount: 1,
          totalViews: 1,
          totalLikes: 1,
          avgViewsPerPost: { $divide: ['$totalViews', '$postCount'] }
        }},
        { $sort: { totalViews: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate growth rates
    const userGrowthRate = newUsersThisMonth > 0 ? 
      ((newUsersThisMonth / (totalUsers || 1)) * 100).toFixed(2) : 0;
    const postGrowthRate = newPostsThisMonth > 0 ? 
      ((newPostsThisMonth / (totalPosts || 1)) * 100).toFixed(2) : 0;
    const commentGrowthRate = newCommentsThisMonth > 0 ? 
      ((newCommentsThisMonth / (totalComments || 1)) * 100).toFixed(2) : 0;

    // Calculate averages
    const avgViewsPerPost = publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0;
    const avgLikesPerPost = publishedPosts > 0 ? Math.round(totalLikes / publishedPosts) : 0;
    const avgCommentsPerPost = publishedPosts > 0 ? Math.round(approvedComments / publishedPosts) : 0;
    const avgReadingTime = publishedPosts > 0 ? Math.round(totalReadingTime / publishedPosts) : 0;

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalViews,
        totalLikes,
        publishedPosts,
        draftPosts,
        featuredPosts,
        totalTags,
        totalReadingTime
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: totalAdmins,
        superAdmins: totalSuperAdmins,
        regular: totalUsers - totalAdmins - totalSuperAdmins,
        growthRate: userGrowthRate
      },
      content: {
        totalPosts,
        publishedPosts,
        draftPosts,
        featuredPosts,
        totalComments,
        approvedComments,
        pendingComments,
        totalTags,
        totalViews,
        totalLikes,
        postGrowthRate,
        commentGrowthRate,
        avgViewsPerPost,
        avgLikesPerPost,
        avgCommentsPerPost,
        avgReadingTime
      },
      activity: {
        today: {
          newUsers: newUsersToday,
          newPosts: newPostsToday,
          newComments: newCommentsToday
        },
        thisWeek: {
          newUsers: newUsersThisWeek,
          newPosts: newPostsThisWeek,
          newComments: newCommentsThisWeek
        },
        thisMonth: {
          newUsers: newUsersThisMonth,
          newPosts: newPostsThisMonth,
          newComments: newCommentsThisMonth
        },
        last3Months: {
          newUsers: newUsersLast3Months,
          newPosts: newPostsLast3Months,
          newComments: newCommentsLast3Months
        }
      },
      engagement: {
        mostViewedPosts,
        mostLikedPosts,
        mostActiveUsers
      },
      systemHealth: {
        activeUsersPercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
        publishedPostsPercentage: totalPosts > 0 ? ((publishedPosts / totalPosts) * 100).toFixed(2) : 0,
        approvedCommentsPercentage: totalComments > 0 ? ((approvedComments / totalComments) * 100).toFixed(2) : 0,
        postsWithCommentsPercentage: publishedPosts > 0 ? (((publishedPosts - (publishedPosts - Math.min(publishedPosts, approvedComments))) / publishedPosts) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      message: 'Failed to fetch system metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/superadmin/users/all
// @desc    Get all users with full details (super admin only)
// @access  Private (Super Admin only)
router.get('/users/all', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['member', 'admin', 'super_admin', 'all']).withMessage('Invalid role filter'),
    query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Invalid status filter')
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
      const status = req.query.status || 'all';

      // Build query
      let query = {};
      if (role !== 'all') {
        query.role = role;
      }
      if (status !== 'all') {
        query.isActive = status === 'active';
      }

      const users = await User.find(query)
        .select('-password') // Never send passwords
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
      console.error('Get all users error:', error);
      res.status(500).json({
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   DELETE /api/superadmin/users/:userId
// @desc    Delete any user (including admins) - super admin only
// @access  Private (Super Admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent super admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's posts and comments
    await Promise.all([
      Post.deleteMany({ author: userId }),
      Comment.deleteMany({ author: userId })
    ]);

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      message: `User ${userToDelete.name} (${userToDelete.email}) has been permanently deleted along with all their content`,
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
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

// @route   PUT /api/superadmin/users/:userId/role
// @desc    Change user role (including promoting/demoting admins)
// @access  Private (Super Admin only)
router.put('/users/:userId/role',
  [
    body('role').isIn(['member', 'admin', 'super_admin']).withMessage('Invalid role')
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

      const { userId } = req.params;
      const { role } = req.body;

      // Prevent super admin from demoting themselves
      if (userId === req.user._id.toString() && role !== 'super_admin') {
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
        message: `User role updated to ${role}`,
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
  }
);

// @route   DELETE /api/superadmin/posts/:postId
// @desc    Delete any post (including admin posts)
// @access  Private (Super Admin only)
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({
      message: `Post "${post.title}" has been permanently deleted along with all its comments`,
      deletedPost: {
        id: post._id,
        title: post.title,
        author: post.author.name,
        authorEmail: post.author.email
      }
    });
  } catch (error) {
    console.error('Delete post error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid post ID' });
    }
    res.status(500).json({
      message: 'Failed to delete post',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/superadmin/analytics/trends
// @desc    Get analytics trends over time (super admin only)
// @access  Private (Super Admin only)
router.get('/analytics/trends', 
  [
    query('period').optional().isIn(['7', '30', '90', '365']).withMessage('Period must be 7, 30, 90, or 365 days')
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

      const period = parseInt(req.query.period) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Users over time
      const usersOverTime = await User.aggregate([
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
            count: { $sum: 1 },
            admins: {
              $sum: {
                $cond: [{ $eq: ['$role', 'admin'] }, 1, 0]
              }
            },
            superAdmins: {
              $sum: {
                $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

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
            count: { $sum: 1 },
            published: {
              $sum: {
                $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
              }
            },
            totalViews: { $sum: '$viewCount' },
            totalLikes: { $sum: '$likeCount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Comments over time
      const commentsOverTime = await Comment.aggregate([
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
            count: { $sum: 1 },
            approved: {
              $sum: {
                $cond: [{ $eq: ['$isApproved', true] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      res.json({
        period,
        trends: {
          users: usersOverTime,
          posts: postsOverTime,
          comments: commentsOverTime
        }
      });
    } catch (error) {
      console.error('Analytics trends error:', error);
      res.status(500).json({
        message: 'Failed to fetch analytics trends',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   GET /api/superadmin/analytics/top-content
// @desc    Get top performing content analytics
// @access  Private (Super Admin only)
router.get('/analytics/top-content', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [topPosts, topAuthors, topTags, recentActivity] = await Promise.all([
      // Top posts by engagement (views + likes)
      Post.aggregate([
        { $match: { status: 'published' } },
        {
          $addFields: {
            engagementScore: { $add: ['$viewCount', { $multiply: ['$likeCount', 3] }] }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            title: 1,
            slug: 1,
            viewCount: 1,
            likeCount: 1,
            commentCount: 1,
            engagementScore: 1,
            publishedAt: 1,
            'author.name': 1,
            'author.email': 1
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: limit }
      ]),

      // Top authors by total engagement
      Post.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$author',
            totalPosts: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalLikes: { $sum: '$likeCount' },
            totalComments: { $sum: '$commentCount' },
            avgViews: { $avg: '$viewCount' },
            avgLikes: { $avg: '$likeCount' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            totalPosts: 1,
            totalViews: 1,
            totalLikes: 1,
            totalComments: 1,
            avgViews: { $round: ['$avgViews', 1] },
            avgLikes: { $round: ['$avgLikes', 1] }
          }
        },
        { $sort: { totalViews: -1 } },
        { $limit: limit }
      ]),

      // Top tags by usage and engagement
      Post.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            postCount: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalLikes: { $sum: '$likeCount' },
            avgViews: { $avg: '$viewCount' }
          }
        },
        {
          $lookup: {
            from: 'tags',
            localField: '_id',
            foreignField: '_id',
            as: 'tag'
          }
        },
        { $unwind: '$tag' },
        {
          $project: {
            name: '$tag.name',
            color: '$tag.color',
            slug: '$tag.slug',
            postCount: 1,
            totalViews: 1,
            totalLikes: 1,
            avgViews: { $round: ['$avgViews', 1] }
          }
        },
        { $sort: { postCount: -1, totalViews: -1 } },
        { $limit: limit }
      ]),

      // Recent high-impact activity
      Post.find({ 
        status: 'published',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .select('title slug viewCount likeCount commentCount createdAt author')
        .populate('author', 'name email')
        .sort({ viewCount: -1, likeCount: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      topPosts,
      topAuthors,
      topTags,
      recentActivity
    });
  } catch (error) {
    console.error('Top content analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch top content analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/superadmin/analytics/user-engagement
// @desc    Get detailed user engagement analytics
// @access  Private (Super Admin only)
router.get('/analytics/user-engagement', async (req, res) => {
  try {
    const [engagementStats, userActivity, contentDistribution] = await Promise.all([
      // Overall engagement statistics
      Post.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalLikes: { $sum: '$likeCount' },
            totalComments: { $sum: '$commentCount' },
            avgViewsPerPost: { $avg: '$viewCount' },
            avgLikesPerPost: { $avg: '$likeCount' },
            avgCommentsPerPost: { $avg: '$commentCount' },
            maxViews: { $max: '$viewCount' },
            maxLikes: { $max: '$likeCount' }
          }
        }
      ]),

      // User activity patterns
      User.aggregate([
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'posts'
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'author',
            as: 'comments'
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            isActive: 1,
            createdAt: 1,
            postCount: { $size: '$posts' },
            commentCount: { $size: '$comments' },
            publishedPosts: {
              $size: {
                $filter: {
                  input: '$posts',
                  cond: { $eq: ['$$this.status', 'published'] }
                }
              }
            }
          }
        },
        {
          $match: {
            $or: [
              { postCount: { $gt: 0 } },
              { commentCount: { $gt: 0 } }
            ]
          }
        },
        { $sort: { postCount: -1, commentCount: -1 } },
        { $limit: 20 }
      ]),

      // Content distribution by role
      User.aggregate([
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'posts'
          }
        },
        {
          $group: {
            _id: '$role',
            userCount: { $sum: 1 },
            totalPosts: { $sum: { $size: '$posts' } },
            publishedPosts: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$posts',
                    cond: { $eq: ['$$this.status', 'published'] }
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            role: '$_id',
            userCount: 1,
            totalPosts: 1,
            publishedPosts: 1,
            avgPostsPerUser: {
              $round: [{ $divide: ['$totalPosts', '$userCount'] }, 2]
            }
          }
        }
      ])
    ]);

    res.json({
      engagementStats: engagementStats[0] || {},
      userActivity,
      contentDistribution
    });
  } catch (error) {
    console.error('User engagement analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch user engagement analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/superadmin/system/cleanup
// @desc    Cleanup orphaned data and optimize system
// @access  Private (Super Admin only)
router.post('/system/cleanup', async (req, res) => {
  try {
    const results = {
      orphanedComments: 0,
      inactiveUsers: 0,
      emptyTags: 0
    };

    // Remove comments for deleted posts
    const orphanedComments = await Comment.find({}).populate('post');
    const commentsToDelete = orphanedComments.filter(comment => !comment.post);
    results.orphanedComments = commentsToDelete.length;
    
    if (commentsToDelete.length > 0) {
      await Comment.deleteMany({
        _id: { $in: commentsToDelete.map(c => c._id) }
      });
    }

    // Remove unused tags
    const allTags = await Tag.find({});
    const tagsToDelete = [];
    
    for (const tag of allTags) {
      const postCount = await Post.countDocuments({ tags: tag._id });
      if (postCount === 0) {
        tagsToDelete.push(tag._id);
      }
    }
    
    results.emptyTags = tagsToDelete.length;
    if (tagsToDelete.length > 0) {
      await Tag.deleteMany({ _id: { $in: tagsToDelete } });
    }

    res.json({
      message: 'System cleanup completed successfully',
      results
    });
  } catch (error) {
    console.error('System cleanup error:', error);
    res.status(500).json({
      message: 'Failed to cleanup system',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
