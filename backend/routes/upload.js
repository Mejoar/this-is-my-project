const express = require('express');
const { upload, handleUploadError } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload/profile
// @desc    Upload profile image
// @access  Private
router.post('/profile',
  authenticateToken,
  upload.single('profileImage'),
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      const profileImageUrl = `/uploads/profiles/${req.file.filename}`;
      
      res.json({
        message: 'Profile image uploaded successfully',
        imageUrl: profileImageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Profile upload error:', error);
      res.status(500).json({
        message: 'Failed to upload profile image',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/upload/post-cover
// @desc    Upload post cover image
// @access  Private (Admin only for now, but can be adjusted)
router.post('/post-cover',
  authenticateToken,
  upload.single('coverImage'),
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      const coverImageUrl = `/uploads/posts/${req.file.filename}`;
      
      res.json({
        message: 'Cover image uploaded successfully',
        imageUrl: coverImageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Cover upload error:', error);
      res.status(500).json({
        message: 'Failed to upload cover image',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple',
  authenticateToken,
  upload.array('images', 5), // Max 5 images
  handleUploadError,
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: 'No files uploaded'
        });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/misc/${file.filename}`,
        size: file.size
      }));
      
      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles,
        count: uploadedFiles.length
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        message: 'Failed to upload files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
