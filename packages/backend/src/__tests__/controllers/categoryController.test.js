const categoryController = require('../../controllers/categoryController');
const db = require('../../db/database');

jest.mock('../../db/database');

describe('Category Controller', () => {
  let req, res, mockDb;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockDb = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    };
    db.getDb.mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', () => {
      const mockCategories = [
        { id: 1, name: 'Electronics', description: 'Electronic devices' },
        { id: 2, name: 'Books', description: 'Books and magazines' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockCategories);
      });

      categoryController.getAllCategories(req, res);

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM categories ORDER BY name', [], expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: mockCategories
      });
    });

    it('should handle error when getting categories', () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      categoryController.getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', () => {
      req.body = {
        name: 'New Category',
        description: 'Test description'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      categoryController.createCategory(req, res);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO categories'),
        ['New Category', 'Test description'],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: 'New Category',
        description: 'Test description'
      });
    });

    it('should return 400 if name is missing', () => {
      req.body = { description: 'Test' };

      categoryController.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category name is required' });
    });

    it('should handle unique constraint error', () => {
      req.body = { name: 'Existing Category' };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('UNIQUE constraint failed'), null);
      });

      categoryController.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category already exists' });
    });
  });

  describe('getCategory', () => {
    it('should return a category by id', () => {
      req.params.id = '1';
      const mockCategory = { id: 1, name: 'Electronics', description: 'Electronic devices' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockCategory);
      });

      categoryController.getCategory(req, res);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM categories WHERE id = ?', ['1'], expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: mockCategory
      });
    });

    it('should return 404 if category not found', () => {
      req.params.id = '999';

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      categoryController.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });
  });

  describe('getCategoryProducts', () => {
    it('should return products for a category', () => {
      req.params.id = '1';
      const mockProducts = [
        { id: 1, name: 'Product 1', category_id: 1 },
        { id: 2, name: 'Product 2', category_id: 1 }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockProducts);
      });

      categoryController.getCategoryProducts(req, res);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE category_id = ?',
        ['1'],
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: mockProducts
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', () => {
      req.params.id = '1';

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 0 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      categoryController.deleteCategory(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should not delete category with products', () => {
      req.params.id = '1';

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 5 });
      });

      categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete category with existing products' });
    });

    it('should return 404 if category not found', () => {
      req.params.id = '999';

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { count: 0 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });
  });
});
