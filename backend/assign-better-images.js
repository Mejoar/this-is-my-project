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

async function assignBetterImages() {
  await connectDB();

  // Get all available images in uploads/posts directory
  const uploadsDir = path.join(__dirname, 'uploads', 'posts');
  const allImages = fs.readdirSync(uploadsDir)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  console.log(`Found ${allImages.length} available images`);

  // Categorize images by topic
  const imageCategories = {
    python: allImages.filter(img => img.includes('python')),
    java: allImages.filter(img => img.includes('java')),
    javascript: allImages.filter(img => img.includes('javascript') || img.includes('web')),
    programming: allImages.filter(img => img.includes('programming') || img.includes('coding')),
    education: allImages.filter(img => img.includes('education') || img.includes('learning')),
    development: allImages.filter(img => img.includes('development') || img.includes('software')),
    data: allImages.filter(img => img.includes('data') || img.includes('machine') || img.includes('ai')),
    database: allImages.filter(img => img.includes('database')),
    server: allImages.filter(img => img.includes('server') || img.includes('devops')),
    general: allImages.filter(img => img.startsWith('coverImage-'))
  };

  console.log('\n📂 Image categories:');
  Object.entries(imageCategories).forEach(([category, images]) => {
    if (images.length > 0) {
      console.log(`   ${category}: ${images.length} images`);
    }
  });

  try {
    // Get all posts (both published and draft)
    const posts = await Post.find({}).populate('author', 'name email');

    console.log(`\n📝 Found ${posts.length} posts total`);

    for (const post of posts) {
      const title = post.title.toLowerCase();
      const content = (post.content || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const combined = `${title} ${content} ${excerpt}`;
      
      let selectedImage;
      let category = 'general';

      // Smart image selection based on content
      if (combined.includes('python') || combined.includes('py ')) {
        const pythonImages = imageCategories.python.concat(imageCategories.data);
        selectedImage = pythonImages[Math.floor(Math.random() * pythonImages.length)];
        category = 'python/data';
      } 
      else if (combined.includes('java') && !combined.includes('javascript')) {
        selectedImage = imageCategories.java[Math.floor(Math.random() * imageCategories.java.length)];
        category = 'java';
      }
      else if (combined.includes('javascript') || combined.includes('js ') || combined.includes('react') || combined.includes('node')) {
        const jsImages = imageCategories.javascript.concat(imageCategories.development);
        selectedImage = jsImages[Math.floor(Math.random() * jsImages.length)];
        category = 'javascript/web';
      }
      else if (combined.includes('rust')) {
        // For Rust, use general programming images
        const rustImages = imageCategories.programming.concat(imageCategories.development);
        selectedImage = rustImages[Math.floor(Math.random() * rustImages.length)];
        category = 'rust/programming';
      }
      else if (combined.includes('education') || combined.includes('learn') || combined.includes('tutorial')) {
        selectedImage = imageCategories.education[Math.floor(Math.random() * imageCategories.education.length)];
        category = 'education';
      }
      else if (combined.includes('database') || combined.includes('mongodb') || combined.includes('sql')) {
        const dbImages = imageCategories.database.concat(imageCategories.server);
        selectedImage = dbImages[Math.floor(Math.random() * dbImages.length)];
        category = 'database';
      }
      else if (combined.includes('server') || combined.includes('devops') || combined.includes('deployment')) {
        selectedImage = imageCategories.server[Math.floor(Math.random() * imageCategories.server.length)];
        category = 'server/devops';
      }
      else if (combined.includes('programming') || combined.includes('coding') || combined.includes('development')) {
        const progImages = imageCategories.programming.concat(imageCategories.development);
        selectedImage = progImages[Math.floor(Math.random() * progImages.length)];
        category = 'programming/development';
      }
      else {
        // Default to a mix of all good programming images
        const defaultImages = [
          ...imageCategories.programming,
          ...imageCategories.development,
          ...imageCategories.general.slice(0, 5) // Only use some of the old generic images
        ];
        selectedImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
        category = 'general';
      }

      if (selectedImage) {
        const newImagePath = `/uploads/posts/${selectedImage}`;
        
        // Only update if the image is different
        if (post.coverImage !== newImagePath) {
          post.coverImage = newImagePath;
          await post.save();

          console.log(`✅ Updated "${post.title}"`);
          console.log(`   Status: ${post.status}`);
          console.log(`   Author: ${post.author.name}`);
          console.log(`   Category: ${category}`);
          console.log(`   Image: ${selectedImage}`);
          console.log('');
        } else {
          console.log(`⚪ "${post.title}" already has this image`);
        }
      } else {
        console.log(`❌ No suitable image found for "${post.title}"`);
      }
    }

    console.log(`\n🎉 Image assignment completed!`);
    
    // Show summary
    const updatedPosts = await Post.find({}).populate('author', 'name');
    const publishedWithImages = updatedPosts.filter(p => p.status === 'published' && p.coverImage);
    const draftWithImages = updatedPosts.filter(p => p.status === 'draft' && p.coverImage);
    
    console.log('\n📊 Summary:');
    console.log(`   Published posts with images: ${publishedWithImages.length}`);
    console.log(`   Draft posts with images: ${draftWithImages.length}`);
    console.log(`   Total images available: ${allImages.length}`);

  } catch (error) {
    console.error('Error assigning images:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
assignBetterImages();
