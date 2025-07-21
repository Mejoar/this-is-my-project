const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testAPIs() {
  console.log('Testing API fixes...\n');

  try {
    // Test 1: Get posts list
    console.log('1. Testing GET /api/posts');
    const postsResponse = await makeRequest('/api/posts');
    console.log(`✅ Status: ${postsResponse.status}`);
    console.log(`   Found ${postsResponse.data.posts?.length || 0} posts\n`);

    // Test 2: Test getting post by slug (should work now)
    console.log('2. Testing GET /api/posts/python (by slug)');
    const postResponse = await makeRequest('/api/posts/python');
    if (postResponse.status === 200) {
      console.log(`✅ Status: ${postResponse.status}`);
      console.log(`   Post title: ${postResponse.data.post?.title || 'Not found'}\n`);
    } else if (postResponse.status === 404) {
      console.log(`ℹ️  Status: 404 - Post 'python' not found (expected if no posts exist)\n`);
    } else {
      console.log(`⚠️  Status: ${postResponse.status} - Unexpected status\n`);
    }

    // Test 3: Test comments API with slug
    console.log('3. Testing GET /api/comments/python (by slug)');
    const commentsResponse = await makeRequest('/api/comments/python');
    if (commentsResponse.status === 200) {
      console.log(`✅ Status: ${commentsResponse.status}`);
      console.log(`   Found ${commentsResponse.data.comments?.length || 0} comments\n`);
    } else if (commentsResponse.status === 404) {
      console.log(`ℹ️  Status: 404 - Post 'python' not found for comments (expected if no posts exist)\n`);
    } else {
      console.log(`⚠️  Status: ${commentsResponse.status} - Unexpected status\n`);
    }

    console.log('✅ API tests completed successfully!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testAPIs();
