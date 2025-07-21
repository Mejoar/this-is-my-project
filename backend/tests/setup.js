const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Global test configuration
global.testUserData = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass123',
    role: 'member'
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'admin'
  },
  superAdminUser: {
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'superadminpass123',
    role: 'super_admin'
  }
};

global.testPostData = {
  validPost: {
    title: 'Test Post Title',
    content: '# Test Post\n\nThis is a test post content.',
    summary: 'This is a test post summary',
    tags: ['test', 'blog'],
    category: 'technology'
  }
};

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 30000);

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

// Increase timeout for database operations
jest.setTimeout(30000);
