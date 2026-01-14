const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const db = require('../../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../db/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Routes Integration Tests', () => {
  let app;
  let mockDb;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', userRoutes);
  });

  beforeEach(() => {
    mockDb = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    };
    db.getDb.mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      bcrypt.hashSync.mockReturnValue('hashedPassword');
      jwt.sign.mockReturnValue('mockToken');

      // Mock username check (no existing user)
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'Password123',
        firstname: 'Test',
        lastname: 'User'
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ auth: true, token: 'mockToken' });
    });

    it('should reject registration with invalid password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'weak',
        firstname: 'Test',
        lastname: 'User'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 500 on database error', async () => {
      bcrypt.hashSync.mockReturnValue('hashedPassword');

      // Mock no existing user
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, new Error('Database error'));
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'Password123',
        firstname: 'Test',
        lastname: 'User'
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error creating user' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        firstname: 'Test',
        lastname: 'User'
      };

      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockToken');

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        auth: true,
        token: 'mockToken',
        user: {
          id: 1,
          username: 'testuser',
          firstname: 'Test',
          lastname: 'User'
        }
      });
    });

    it('should return 401 for non-existent user', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).post('/api/auth/login').send({
        username: 'nonexistent',
        password: 'password123'
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword'
      };

      bcrypt.compareSync.mockReturnValue(false);

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid username or password' });
    });
  });

  describe('GET /api/auth/users', () => {
    it('should return all users with valid token', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', firstname: 'First1', lastname: 'Last1', created_at: '2024-01-01' },
        { id: 2, username: 'user2', firstname: 'First2', lastname: 'Last2', created_at: '2024-01-02' }
      ];

      jwt.verify.mockReturnValue({ id: 1 });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockUsers);
      });

      const response = await request(app).get('/api/auth/users').set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/users');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'No token provided' });
    });
  });

  describe('GET /api/auth/similar-usernames', () => {
    it('should find similar usernames with valid token', async () => {
      const mockUsers = [{ username: 'john' }, { username: 'johnn' }];

      jwt.verify.mockReturnValue({ id: 1 });
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockUsers);
      });

      const response = await request(app).get('/api/auth/similar-usernames').set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
