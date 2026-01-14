const db = require('../db/database');

exports.getAllProducts = (req, res) => {
  const database = db.getDb();

  database.all(
    `SELECT p.*, c.name as category_name, c.description as category_description 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id`,
    [],
    async function (error, products) {
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      const productsWithDetails = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        await new Promise((resolve) => {
          database.get('SELECT COUNT(*) as total FROM products WHERE price <= ?', [product.price], (err, result) => {
            if (!err) {
              product.cheaperCount = result.total;
            }
            resolve();
          });
        });

        await new Promise((resolve) => {
          database.get('SELECT AVG(price) as avg FROM products', [], (err, result) => {
            if (!err) {
              product.avgPrice = result.avg;
            }
            resolve();
          });
        });

        productsWithDetails.push(product);
      }

      res.json({
        message: 'success',
        data: productsWithDetails
      });
    }
  );
};

exports.createProduct = (req, res) => {
  const { name, price, stock, category_id } = req.body;
  const database = db.getDb();

  database.run(
    `INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)`,
    [name, price, stock, category_id || null],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating product' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        price,
        stock,
        category_id
      });
    }
  );
};

exports.getProduct = (req, res) => {
  const id = req.params.id;
  const database = db.getDb();

  database.get(
    `SELECT p.*, c.name as category_name, c.description as category_description 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [id],
    (error, result) => {
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.json({
        message: 'success',
        data: result
      });
    }
  );
};

exports.updateStock = (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const database = db.getDb();

  database.run(`UPDATE products SET stock = ? WHERE id = ?`, [stock, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  });
};
