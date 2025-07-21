const request = require('supertest');
const app = require('../../../server');
const { createAuthenticatedUser } = require('../../utils/testHelpers');

let authToken;

beforeAll(async () => {
  const user = await createAuthenticatedUser();
  authToken = user.token;
});

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'newuserpass'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Existing User',
          email: 'duplicate@example.com',
          password: 'testpass123'
        });

      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'anotherpass123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should not login a user with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('No authorization header provided');
    });
  });
});

