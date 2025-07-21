const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { body, validationResult } = require('express-validator');

// Subscribe to newsletter
router.post('/subscribe', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(409).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate unsubscribed user
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = null;
        await existingSubscriber.save();
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated'
        });
      }
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({
      email,
      source: req.body.source || 'homepage'
    });

    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed! Thank you for joining our newsletter'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later'
    });
  }
});

// Unsubscribe from newsletter (for future use)
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    const { email } = req.body;
    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list'
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(400).json({
        success: false,
        message: 'This email is already unsubscribed'
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later'
    });
  }
});

// Get subscriber stats (admin only - for future dashboard integration)
router.get('/stats', async (req, res) => {
  try {
    const totalSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const totalUnsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });
    
    // Get subscription growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubscribers = await Subscriber.countDocuments({
      status: 'active',
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        recentSubscribers,
        totalAll: totalSubscribers + totalUnsubscribed
      }
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics'
    });
  }
});

module.exports = router;
