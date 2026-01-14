const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../../routes/categoryRoutes');
const db = require('../../db/database');
const jwt = require('jsonwebtoken');

jest.mock('../../db/database');
jest.mock('jsonwebtoken');

describe('Category Routes Integration Tests', () => {
  let app;
  let mockDb;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', categoryRoutes);
  });

  beforeEach(() => {
    mockDb = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    };
    db.getDb.mockReturnValue(mockDb);
    jwt.verify.mockReturnValue({ id: 1 });
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return all categories without token required', async () => {
      const mockCategories = [
        { id: 1, name: 'Electronics', description: 'Electronic devices' },
        { id: 2, name: 'Clothing', description: 'Apparel and fashion' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockCategories);
      });

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('success');
      expect(response.body.data).toEqual(mockCategories);
    });

    it('should handle database error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category with valid token', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer validtoken')
        .send({ name: 'Electronics', description: 'Electronic devices' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        name: 'Electronics',
        description: 'Electronic devices'
      });
    });

    it('should return 401 without token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Electronics', description: 'Electronic devices' });

      expect(response.status).toBe(401);
    });

    it('should return 400 on duplicate name', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        const error = new Error('UNIQUE constraint failed: categories.name');
        callback.call({ lastID: 1 }, error);
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer validtoken')
        .send({ name: 'Electronics', description: 'Electronic devices' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Category name already exists' });
    });

    it('should return 400 on database error', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, new Error('Database error'));
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer validtoken')
        .send({ name: 'Electronics', description: 'Electronic devices' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error creating category' });
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a single category without token required', async () => {
      const mockCategory = { id: 1, name: 'Electronics', description: 'Electronic devices' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockCategory);
      });

      const response = await request(app).get('/api/categories/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('success');
      expect(response.body.data).toEqual(mockCategory);
    });

    it('should return 404 if category not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/categories/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });

    it('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/categories/1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('should update a category with valid token', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app)
        .patch('/api/categories/1')
        .set('Authorization', 'Bearer validtoken')
        .send({ name: 'Updated Electronics', description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should return 401 without token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .patch('/api/categories/1')
        .send({ name: 'Updated Electronics', description: 'Updated description' });

      expect(response.status).toBe(401);
    });

    it('should return 404 if category not found', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app)
        .patch('/api/categories/999')
        .set('Authorization', 'Bearer validtoken')
        .send({ name: 'Updated Electronics', description: 'Updated description' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category with valid token', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const response = await request(app).delete('/api/categories/1').set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should return 401 without token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app).delete('/api/categories/1');

      expect(response.status).toBe(401);
    });

    it('should return 404 if category not found', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const response = await request(app).delete('/api/categories/999').set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });

    it('should handle database error', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, new Error('Database error'));
      });

      const response = await request(app).delete('/api/categories/1').set('Authorization', 'Bearer validtoken');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete category' });
    });
  });
});
