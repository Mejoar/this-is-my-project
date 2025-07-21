const User = require('../../../models/User');
const { createTestUser } = require('../../utils/testHelpers');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.role).toBe('member'); // Default role
      expect(savedUser.isActive).toBe(true); // Default active
    });

    it('should hash password before saving', async () => {
      const plainPassword = 'testpass123';
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword
      });

      await user.save();
      
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(50); // Hashed password should be longer
    });

    it('should validate email format', async () => {
      const user = new User({
        name: 'Test User',
        email: 'invalid-email',
        password: 'testpass123'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should enforce unique email constraint', async () => {
      const email = 'duplicate@example.com';
      
      // Create first user
      await createTestUser({
        name: 'User One',
        email,
        password: 'testpass123'
      });

      // Try to create second user with same email
      const duplicateUser = new User({
        name: 'User Two',
        email,
        password: 'testpass456'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should enforce password minimum length', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too short
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.password.message).toContain('at least 6 characters');
    });

    it('should enforce name maximum length', async () => {
      const user = new User({
        name: 'A'.repeat(51), // Too long
        email: 'test@example.com',
        password: 'testpass123'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toContain('cannot exceed 50 characters');
    });

    it('should validate role enum values', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
        role: 'invalid_role'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });
  });

  describe('User Methods', () => {
    it('should compare password correctly', async () => {
      const plainPassword = 'testpass123';
      const user = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should exclude password from JSON output', async () => {
      const user = await createTestUser();
      const userJson = user.toJSON();
      
      expect(userJson.password).toBeUndefined();
      expect(userJson.name).toBeDefined();
      expect(userJson.email).toBeDefined();
      expect(userJson.role).toBeDefined();
    });
  });

  describe('User Indexes', () => {
    it('should have email index for faster queries', async () => {
      const indexes = await User.collection.getIndexes();
      const emailIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'email')
      );
      
      expect(emailIndex).toBeDefined();
    });

    it('should have role index for faster queries', async () => {
      const indexes = await User.collection.getIndexes();
      const roleIndex = Object.keys(indexes).find(key => 
        indexes[key].some(field => field[0] === 'role')
      );
      
      expect(roleIndex).toBeDefined();
    });
  });

  describe('User Updates', () => {
    it('should not rehash password if not modified', async () => {
      const user = await createTestUser();
      const originalPassword = user.password;

      // Update name without changing password
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });

    it('should hash password when modified', async () => {
      const user = await createTestUser();
      const originalPassword = user.password;

      // Update password
      user.password = 'newpassword123';
      await user.save();

      expect(user.password).not.toBe(originalPassword);
      expect(user.password).not.toBe('newpassword123'); // Should be hashed

      // Verify new password works
      const isMatch = await user.comparePassword('newpassword123');
      expect(isMatch).toBe(true);
    });
  });
});
