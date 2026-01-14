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
        { id: 2, name: 'Clothing', description: 'Apparel and fashion' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockCategories);
      });

      categoryController.getAllCategories(req, res);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories'),
        [],
        expect.any(Function)
      );
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
        name: 'Electronics',
        description: 'Electronic devices'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      categoryController.createCategory(req, res);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO categories'),
        ['Electronics', 'Electronic devices'],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: 'Electronics',
        description: 'Electronic devices'
      });
    });

    it('should handle duplicate category name', () => {
      req.body = {
        name: 'Electronics',
        description: 'Electronic devices'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        const error = new Error('UNIQUE constraint failed: categories.name');
        callback.call({ lastID: 1 }, error);
      });

      categoryController.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category name already exists' });
    });

    it('should return error if name is empty', () => {
      req.body = {
        name: '',
        description: 'Electronic devices'
      };

      categoryController.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category name is required' });
    });

    it('should handle database error', () => {
      req.body = {
        name: 'Electronics',
        description: 'Electronic devices'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, new Error('Database error'));
      });

      categoryController.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating category' });
    });
  });

  describe('getCategory', () => {
    it('should return a single category', () => {
      req.params = { id: 1 };
      const mockCategory = { id: 1, name: 'Electronics', description: 'Electronic devices' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockCategory);
      });

      categoryController.getCategory(req, res);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories WHERE id = ?'),
        [1],
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: mockCategory
      });
    });

    it('should return 404 if category not found', () => {
      req.params = { id: 999 };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      categoryController.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should handle database error', () => {
      req.params = { id: 1 };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      categoryController.getCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', () => {
      req.params = { id: 1 };
      req.body = {
        name: 'Updated Electronics',
        description: 'Updated description'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      categoryController.updateCategory(req, res);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categories'),
        ['Updated Electronics', 'Updated description', 1],
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 if category not found', () => {
      req.params = { id: 999 };
      req.body = {
        name: 'Updated Electronics',
        description: 'Updated description'
      };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      categoryController.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should return error if name is empty', () => {
      req.params = { id: 1 };
      req.body = {
        name: '',
        description: 'Updated description'
      };

      categoryController.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category name is required' });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', () => {
      req.params = { id: 1 };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      categoryController.deleteCategory(req, res);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM categories WHERE id = ?'),
        [1],
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 if category not found', () => {
      req.params = { id: 999 };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should handle database error', () => {
      req.params = { id: 1 };

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, new Error('Database error'));
      });

      categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete category' });
    });
  });
});
