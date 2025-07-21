const https = require('https');
const fs = require('fs');
const path = require('path');

// Programming-related free images from Unsplash
const imageUrls = [
  // Python related
  {
    url: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&h=600&fit=crop&crop=center',
    filename: 'python-programming-1.jpg',
    topic: 'python'
  },
  {
    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&crop=center',
    filename: 'python-code-2.jpg',
    topic: 'python'
  },
  
  // JavaScript/Web Development
  {
    url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop&crop=center',
    filename: 'javascript-code-1.jpg',
    topic: 'javascript'
  },
  {
    url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=600&fit=crop&crop=center',
    filename: 'web-development-1.jpg',
    topic: 'web'
  },
  
  // Java related
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
    filename: 'java-programming-1.jpg',
    topic: 'java'
  },
  {
    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&crop=center',
    filename: 'java-development-2.jpg',
    topic: 'java'
  },
  
  // General programming
  {
    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center',
    filename: 'programming-general-1.jpg',
    topic: 'programming'
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&crop=center',
    filename: 'coding-screen-1.jpg',
    topic: 'coding'
  },
  {
    url: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop&crop=center',
    filename: 'software-development-1.jpg',
    topic: 'development'
  },
  
  // Data Science / AI
  {
    url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&crop=center',
    filename: 'data-science-1.jpg',
    topic: 'data'
  },
  {
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&crop=center',
    filename: 'machine-learning-1.jpg',
    topic: 'ai'
  },
  
  // Database
  {
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop&crop=center',
    filename: 'database-1.jpg',
    topic: 'database'
  },
  
  // DevOps / Server
  {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
    filename: 'server-1.jpg',
    topic: 'server'
  },
  {
    url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=600&fit=crop&crop=center',
    filename: 'devops-1.jpg',
    topic: 'devops'
  },
  
  // Education/Learning
  {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
    filename: 'education-1.jpg',
    topic: 'education'
  },
  {
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
    filename: 'learning-1.jpg',
    topic: 'learning'
  }
];

function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const { url, filename, topic } = imageData;
    const uploadsDir = path.join(__dirname, 'uploads', 'posts');
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  Image ${filename} already exists, skipping...`);
      resolve({ filename, topic, status: 'exists' });
      return;
    }
    
    console.log(`📥 Downloading ${filename} (${topic})...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve({ filename, topic, status: 'downloaded' });
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function addImages() {
  console.log('🖼️  Starting image download process...\n');
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads', 'posts');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }
  
  const results = {
    downloaded: [],
    exists: [],
    errors: []
  };
  
  // Download images one by one to avoid overwhelming the server
  for (const imageData of imageUrls) {
    try {
      const result = await downloadImage(imageData);
      if (result.status === 'downloaded') {
        results.downloaded.push(result);
      } else if (result.status === 'exists') {
        results.exists.push(result);
      }
      
      // Add a small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error downloading ${imageData.filename}:`, error.message);
      results.errors.push({ filename: imageData.filename, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Download Summary:');
  console.log(`✅ Downloaded: ${results.downloaded.length} images`);
  console.log(`⚠️  Already existed: ${results.exists.length} images`);
  console.log(`❌ Errors: ${results.errors.length} images`);
  
  if (results.downloaded.length > 0) {
    console.log('\n🎉 New images added:');
    results.downloaded.forEach(img => {
      console.log(`   - ${img.filename} (${img.topic})`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed downloads:');
    results.errors.forEach(err => {
      console.log(`   - ${err.filename}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Image download process completed!');
  console.log('💡 You can now use these images in your blog posts.');
}

// Run the script
addImages().catch(console.error);
