const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Validation rules
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters')
];

// @route   GET /api/comments/:postId
// @desc    Get comments for a specific post
// @access  Public
router.get('/:postId',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Check if post exists and is published
      const post = await Post.findById(postId);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Get root-level comments (not replies)
      const comments = await Comment.find({ 
        post: postId, 
        parentComment: null,
        isApproved: true 
      })
      .populate('author', 'name profileImage')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name profileImage'
        },
        match: { isApproved: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      // Get total count for pagination
      const totalComments = await Comment.countDocuments({ 
        post: postId, 
        parentComment: null,
        isApproved: true 
      });

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
      console.error('Get comments error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid post ID' });
      }
      res.status(500).json({
        message: 'Failed to fetch comments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/comments/:postId
// @desc    Add a new comment to a post
// @access  Private
router.post('/:postId',
  authenticateToken,
  commentValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { postId } = req.params;
      const { content } = req.body;

      // Check if post exists and is published
      const post = await Post.findById(postId);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Create comment
      const comment = new Comment({
        content,
        author: req.user._id,
        post: postId
      });

      await comment.save();

      // Populate author information for response
      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'name profileImage')
        .lean();

      res.status(201).json({
        message: 'Comment added successfully',
        comment: populatedComment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid post ID' });
      }
      res.status(500).json({
        message: 'Failed to add comment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/comments/:commentId/reply
// @desc    Reply to an existing comment
// @access  Private
router.post('/:commentId/reply',
  authenticateToken,
  commentValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;

      // Check if parent comment exists
      const parentComment = await Comment.findById(commentId).populate('post');
      if (!parentComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if the post is published
      if (parentComment.post.status !== 'published') {
        return res.status(404).json({ message: 'Cannot reply to comment on unpublished post' });
      }

      // Create reply
      const reply = new Comment({
        content,
        author: req.user._id,
        post: parentComment.post._id,
        parentComment: commentId
      });

      await reply.save();

      // Add reply to parent comment's replies array
      parentComment.replies.push(reply._id);
      await parentComment.save();

      // Populate author information for response
      const populatedReply = await Comment.findById(reply._id)
        .populate('author', 'name profileImage')
        .lean();

      res.status(201).json({
        message: 'Reply added successfully',
        comment: populatedReply
      });
    } catch (error) {
      console.error('Create reply error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to add reply',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/comments/:commentId/generate-ai-reply
// @desc    Generate AI-powered reply to a comment
// @access  Private (Admin only)
router.post('/:commentId/generate-ai-reply',
  authenticateToken,
  requireAdmin,
  [
    body('tone').optional().trim().isIn(['friendly', 'professional', 'casual', 'formal'])
      .withMessage('Tone must be one of: friendly, professional, casual, formal')
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

      const { commentId } = req.params;
      const { tone = 'friendly' } = req.body;

      // Check if comment exists
      const comment = await Comment.findById(commentId).populate('post', 'title');
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (!aiService.isAvailable()) {
        return res.status(503).json({ 
          message: 'AI service is not available at the moment' 
        });
      }

      // Generate AI reply
      const aiReply = await aiService.generateCommentReply(
        comment.content,
        comment.post.title,
        tone
      );

      res.json({
        message: 'AI reply generated successfully',
        generatedReply: aiReply
      });
    } catch (error) {
      console.error('Generate AI reply error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to generate AI reply',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   PUT /api/comments/:commentId
// @desc    Update a comment (author only or admin)
// @access  Private
router.put('/:commentId',
  authenticateToken,
  commentValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;

      // Find comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the comment author or admin
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this comment' });
      }

      // Update comment
      comment.content = content;
      await comment.save();

      // Populate author information for response
      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'name profileImage')
        .lean();

      res.json({
        message: 'Comment updated successfully',
        comment: populatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to update comment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private (Admin only or comment author)
router.delete('/:commentId',
  authenticateToken,
  async (req, res) => {
    try {
      const { commentId } = req.params;

      // Find comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the comment author or admin
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      // If this is a parent comment, also delete all replies
      if (!comment.parentComment) {
        await Comment.deleteMany({ parentComment: commentId });
      } else {
        // If this is a reply, remove it from parent's replies array
        await Comment.findByIdAndUpdate(
          comment.parentComment,
          { $pull: { replies: commentId } }
        );
      }

      // Delete the comment
      await Comment.findByIdAndDelete(commentId);

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to delete comment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:commentId/like',
  authenticateToken,
  async (req, res) => {
    try {
      const { commentId } = req.params;

      // Find comment
      const comment = await Comment.findById(commentId);
      if (!comment || !comment.isApproved) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // For simplicity, we'll just increment the like count
      // In a more complex system, you might track who liked what
      comment.likeCount += 1;
      await comment.save();

      res.json({
        message: 'Comment liked successfully',
        likeCount: comment.likeCount
      });
    } catch (error) {
      console.error('Like comment error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to like comment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   PUT /api/comments/:commentId/approve
// @desc    Approve/disapprove a comment
// @access  Private (Admin only)
router.put('/:commentId/approve',
  authenticateToken,
  requireAdmin,
  [
    body('isApproved').isBoolean().withMessage('isApproved must be a boolean value')
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

      const { commentId } = req.params;
      const { isApproved } = req.body;

      // Find and update comment
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { isApproved },
        { new: true }
      ).populate('author', 'name profileImage');

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      res.json({
        message: `Comment ${isApproved ? 'approved' : 'disapproved'} successfully`,
        comment
      });
    } catch (error) {
      console.error('Approve comment error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid comment ID' });
      }
      res.status(500).json({
        message: 'Failed to update comment approval status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
