const db = require('../db/database');

exports.getAllCategories = (req, res) => {
  const database = db.getDb();

  database.all('SELECT * FROM categories ORDER BY name', [], (error, categories) => {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({
      message: 'success',
      data: categories
    });
  });
};

exports.createCategory = (req, res) => {
  const { name, description } = req.body;
  const database = db.getDb();

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  database.run(
    `INSERT INTO categories (name, description) VALUES (?, ?)`,
    [name.trim(), description || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Error creating category' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        description: description || null
      });
    }
  );
};

exports.getCategory = (req, res) => {
  const id = req.params.id;
  const database = db.getDb();

  database.get('SELECT * FROM categories WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({
      message: 'success',
      data: result
    });
  });
};

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const database = db.getDb();

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  database.run(
    `UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name.trim(), description || null, id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
        return res.status(500).json({ error: 'Failed to update category' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ success: true });
    }
  );
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  const database = db.getDb();

  database.run(`DELETE FROM categories WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete category' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true });
  });
};
