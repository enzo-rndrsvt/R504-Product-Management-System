const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../../routes/categoryRoutes');
const categoryController = require('../../controllers/categoryController');
const authMiddleware = require('../../middleware/auth');

jest.mock('../../controllers/categoryController');
jest.mock('../../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Category Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMiddleware.mockImplementation((req, res, next) => next());
  });

  describe('GET /api/categories', () => {
    it('should call getAllCategories controller', async () => {
      categoryController.getAllCategories.mockImplementation((req, res) => {
        res.json({ message: 'success', data: [] });
      });

      const response = await request(app).get('/api/categories');

      expect(categoryController.getAllCategories).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should call getCategory controller', async () => {
      categoryController.getCategory.mockImplementation((req, res) => {
        res.json({ message: 'success', data: {} });
      });

      const response = await request(app).get('/api/categories/1');

      expect(categoryController.getCategory).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/categories/:id/products', () => {
    it('should call getCategoryProducts controller', async () => {
      categoryController.getCategoryProducts.mockImplementation((req, res) => {
        res.json({ message: 'success', data: [] });
      });

      const response = await request(app).get('/api/categories/1/products');

      expect(categoryController.getCategoryProducts).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/categories', () => {
    it('should call createCategory controller with auth', async () => {
      categoryController.createCategory.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: 'Test' });
      });

      const response = await request(app).post('/api/categories').send({ name: 'Test Category' });

      expect(authMiddleware).toHaveBeenCalled();
      expect(categoryController.createCategory).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should call deleteCategory controller with auth', async () => {
      categoryController.deleteCategory.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).delete('/api/categories/1');

      expect(authMiddleware).toHaveBeenCalled();
      expect(categoryController.deleteCategory).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});
