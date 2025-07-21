const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Post = require('../../models/Post');

/**
 * Create a test user and return the user object
 * @param {Object} userData - User data to create
 * @returns {Object} Created user object
 */
const createTestUser = async (userData = global.testUserData.validUser) => {
  const user = new User(userData);
  await user.save();
  return user;
};

/**
 * Create a test user and return authentication token
 * @param {Object} userData - User data to create
 * @returns {Object} Object containing user and token
 */
const createAuthenticatedUser = async (userData = global.testUserData.validUser) => {
  const user = await createTestUser(userData);
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );
  return { user, token };
};

/**
 * Create a test post
 * @param {Object} postData - Post data to create
 * @param {String} authorId - Author's user ID
 * @returns {Object} Created post object
 */
const createTestPost = async (postData = global.testPostData.validPost, authorId) => {
  let author = authorId;
  
  // If no authorId provided, create a test user
  if (!author) {
    const user = await createTestUser();
    author = user._id;
  }
  
  const post = new Post({
    ...postData,
    author,
    slug: postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  });
  
  await post.save();
  return post;
};

/**
 * Generate authentication headers for requests
 * @param {String} token - JWT token
 * @returns {Object} Headers object
 */
const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

/**
 * Create multiple test users with different roles
 * @returns {Object} Object containing all created users with tokens
 */
const createTestUsers = async () => {
  const member = await createAuthenticatedUser(global.testUserData.validUser);
  const admin = await createAuthenticatedUser(global.testUserData.adminUser);
  const superAdmin = await createAuthenticatedUser(global.testUserData.superAdminUser);
  
  return {
    member,
    admin,
    superAdmin
  };
};

/**
 * Clean up uploaded test files
 * @param {Array} filePaths - Array of file paths to clean up
 */
const cleanupTestFiles = (filePaths) => {
  const fs = require('fs');
  const path = require('path');
  
  filePaths.forEach(filePath => {
    const fullPath = path.join(__dirname, '../../uploads', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });
};

/**
 * Wait for a specified amount of time
 * @param {Number} ms - Milliseconds to wait
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random string for testing
 * @param {Number} length - Length of random string
 * @returns {String} Random string
 */
const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Validate JWT token
 * @param {String} token - Token to validate
 * @returns {Object} Decoded token payload
 */
const validateToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
};

module.exports = {
  createTestUser,
  createAuthenticatedUser,
  createTestPost,
  getAuthHeaders,
  createTestUsers,
  cleanupTestFiles,
  wait,
  generateRandomString,
  validateToken
};
