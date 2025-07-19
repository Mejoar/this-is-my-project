const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
tagSchema.index({ name: 1 });
tagSchema.index({ slug: 1 });

// Generate slug from name
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Tag', tagSchema);
