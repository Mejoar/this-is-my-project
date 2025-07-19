const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Update comment count in post when comment is added
commentSchema.post('save', async function() {
  if (this.isNew && !this.parentComment) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(
      this.post,
      { $inc: { commentCount: 1 } }
    );
  }
});

// Update comment count in post when comment is removed
commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc && !doc.parentComment) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(
      doc.post,
      { $inc: { commentCount: -1 } }
    );
  }
});

module.exports = mongoose.model('Comment', commentSchema);
