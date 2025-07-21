const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkPosts() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('thisblog');
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');
        
        // Check total number of posts
        const postCount = await postsCollection.countDocuments();
        console.log(`\nTotal posts in database: ${postCount}`);
        
        if (postCount > 0) {
            // Get all posts with full details
            const posts = await postsCollection.find({}).toArray();
            console.log('\n=== ALL POSTS ===');
            posts.forEach((post, index) => {
                console.log(`\nPost ${index + 1}:`);
                console.log(`- ID: ${post._id}`);
                console.log(`- Title: ${post.title}`);
                console.log(`- Author field: ${post.author}`);
                console.log(`- Author type: ${typeof post.author}`);
                console.log(`- Created: ${post.createdAt}`);
                console.log(`- Status: ${post.status}`);
                if (post.tags && post.tags.length > 0) {
                    console.log(`- Tags: ${post.tags.map(tag => typeof tag === 'object' ? tag.name || tag._id : tag).join(', ')}`);
                }
            });
        }
        
        // Check users
        const userCount = await usersCollection.countDocuments();
        console.log(`\n\nTotal users in database: ${userCount}`);
        
        if (userCount > 0) {
            const users = await usersCollection.find({}).toArray();
            console.log('\n=== ALL USERS ===');
            users.forEach((user, index) => {
                console.log(`\nUser ${index + 1}:`);
                console.log(`- ID: ${user._id}`);
                console.log(`- Username: ${user.username}`);
                console.log(`- Email: ${user.email}`);
                console.log(`- Role: ${user.role}`);
            });
        }
        
    } catch (error) {
        console.error('Error checking posts:', error);
    } finally {
        await client.close();
    }
}

checkPosts();
