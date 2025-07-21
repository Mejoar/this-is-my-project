const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
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

async function checkCoverImages() {
  await connectDB();

  try {
    const allPosts = await Post.find({}).populate('author', 'name email').sort({ createdAt: -1 });

    console.log(`\n=== ALL POSTS WITH COVER IMAGE STATUS ===\n`);

    for (const post of allPosts) {
      console.log(`📝 Post: "${post.title}"`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Author: ${post.author.name} (${post.author.email})`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Cover Image: ${post.coverImage || 'NO IMAGE'}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log('');
    }

    // Separate analysis
    const publishedPosts = allPosts.filter(p => p.status === 'published');
    const postsWithImages = publishedPosts.filter(p => p.coverImage && p.coverImage !== '');
    const postsWithoutImages = publishedPosts.filter(p => !p.coverImage || p.coverImage === '');

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total posts: ${allPosts.length}`);
    console.log(`Published posts: ${publishedPosts.length}`);
    console.log(`Published posts with images: ${postsWithImages.length}`);
    console.log(`Published posts without images: ${postsWithoutImages.length}`);

    if (postsWithoutImages.length > 0) {
      console.log(`\n=== POSTS NEEDING IMAGES ===`);
      for (const post of postsWithoutImages) {
        console.log(`❌ "${post.title}" (ID: ${post._id})`);
      }
    }

  } catch (error) {
    console.error('Error checking cover images:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCoverImages();
