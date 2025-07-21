const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function assignCoverImages() {
  await connectDB();

  // Get all available images in uploads/posts directory
  const uploadsDir = path.join(__dirname, 'uploads', 'posts');
  const availableImages = fs.readdirSync(uploadsDir)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  console.log(`Found ${availableImages.length} available images`);

  // Define image mappings for different post topics
  const imageMapping = {
    'python': availableImages[0] || 'coverImage-1753012691962-296593600.jpg',
    'java': availableImages[1] || 'coverImage-1753013081785-519656623.jpg',
    'rust': availableImages[2] || 'coverImage-1753013441255-484474385.jpg',
    'education': availableImages[3] || 'coverImage-1753016552579-577838096.jpg',
    'programming': availableImages[4] || 'coverImage-1753016747055-714783251.jpg',
    'default': availableImages[5] || 'coverImage-1753032750304-995464828.jpg'
  };

  try {
    // Get all published posts without cover images
    const posts = await Post.find({ 
      status: 'published',
      $or: [
        { coverImage: '' },
        { coverImage: { $exists: false } }
      ]
    }).populate('author', 'name email');

    console.log(`\nFound ${posts.length} posts without cover images:`);

    for (const post of posts) {
      let selectedImage;
      const title = post.title.toLowerCase();

      // Select appropriate image based on post title/content
      if (title.includes('python')) {
        selectedImage = imageMapping['python'];
      } else if (title.includes('java')) {
        selectedImage = imageMapping['java'];
      } else if (title.includes('rust')) {
        selectedImage = imageMapping['rust'];
      } else if (title.includes('education') || title.includes('learn')) {
        selectedImage = imageMapping['education'];
      } else {
        // Use different images for different posts to avoid repetition
        const index = posts.indexOf(post) % availableImages.length;
        selectedImage = availableImages[index];
      }

      // Update the post with the cover image
      post.coverImage = `/uploads/posts/${selectedImage}`;
      await post.save();

      console.log(`✓ Updated post "${post.title}" with image: ${selectedImage}`);
      console.log(`  Author: ${post.author.name} (${post.author.email})`);
      console.log(`  Post ID: ${post._id}`);
      console.log('');
    }

    // Also get draft posts for information
    const draftPosts = await Post.find({ status: 'draft' }).populate('author', 'name email');
    
    if (draftPosts.length > 0) {
      console.log(`\n=== DRAFT POSTS (not updated) ===`);
      for (const post of draftPosts) {
        console.log(`Draft: "${post.title}" by ${post.author.name}`);
      }
    }

    console.log(`\n✅ Successfully assigned cover images to ${posts.length} published posts!`);

  } catch (error) {
    console.error('Error assigning cover images:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
assignCoverImages();
