const initDatabase = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Users table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstname TEXT,
          lastname TEXT,
          username TEXT UNIQUE,
          password TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME
        )
      `,
        (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
          }
        }
      );

      // Create Categories table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT (datetime('now')),
          updated_at DATETIME
        )
      `,
        (err) => {
          if (err) {
            console.error('Error creating categories table:', err);
            reject(err);
          }
        }
      );

      // Create Products table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL DEFAULT 0,
          stock INTEGER DEFAULT 0,
          category_id INTEGER,
          created_at DATETIME DEFAULT (datetime('now')),
          updated_at DATETIME,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `,
        (err) => {
          if (err) {
            console.error('Error creating products table:', err);
            reject(err);
          }
        }
      );

      // Add sample data if tables are empty
      db.get('SELECT COUNT(*) as count FROM categories', [], (err, result) => {
        if (err) {
          console.error('Error checking categories:', err);
          reject(err);
          return;
        }

        if (result.count === 0) {
          const sampleCategories = [
            ['Electronics', 'Electronic devices and accessories'],
            ['Clothing', 'Apparel and fashion items'],
            ['Home & Garden', 'Household and garden products'],
            ['Sports', 'Sports and fitness equipment']
          ];

          sampleCategories.forEach(([name, description]) => {
            db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description], (err) => {
              if (err) console.error('Error inserting category:', name, err);
            });
          });
        }
      });

      db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
        if (err) {
          console.error('Error checking users:', err);
          reject(err);
          return;
        }

        if (result.count === 0) {
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 8);

          db.run(
            `
            INSERT INTO users (firstname, lastname, username, password)
            VALUES (?, ?, ?, ?)
          `,
            ['Admin', 'User', 'admin', hashedPassword],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
                reject(err);
              }
            }
          );
        }
      });

      db.get('SELECT COUNT(*) as count FROM products', [], (err, result) => {
        if (err) {
          console.error('Error checking products:', err);
          reject(err);
          return;
        }

        if (result.count === 0) {
          const sampleProducts = [
            // Electronics (category_id: 1)
            ['MacBook Pro 16"', 2499.99, 3, 1],
            ['Dell XPS 15', 1899.99, 12, 1],
            ['iPhone 15 Pro', 1199.99, 25, 1],
            ['Samsung Galaxy S24', 899.99, 30, 1],
            ['iPad Air', 599.99, 18, 1],
            ['Sony WH-1000XM5 Headphones', 399.99, 15, 1],
            ['AirPods Pro', 249.99, 40, 1],
            ['Gaming Mouse Logitech G502', 79.99, 50, 1],
            ['Mechanical Keyboard RGB', 149.99, 22, 1],
            ['27" 4K Monitor', 449.99, 5, 1],
            ['Webcam Logitech C920', 89.99, 35, 1],
            ['USB-C Hub 7-in-1', 49.99, 60, 1],
            ['Portable SSD 1TB', 129.99, 45, 1],
            ['Wireless Charger', 29.99, 100, 1],
            ['Smart Watch', 349.99, 20, 1],

            // Clothing (category_id: 2)
            ['Cotton T-Shirt Black', 19.99, 150, 2],
            ['Denim Jeans Blue', 59.99, 80, 2],
            ['Leather Jacket', 199.99, 7, 2],
            ['Running Shoes Nike', 129.99, 45, 2],
            ['Winter Coat', 149.99, 25, 2],
            ['Dress Shirt White', 39.99, 60, 2],
            ['Casual Sneakers', 79.99, 70, 2],
            ['Baseball Cap', 24.99, 90, 2],
            ['Wool Scarf', 34.99, 40, 2],
            ['Leather Belt', 29.99, 55, 2],

            // Home & Garden (category_id: 3)
            ['Coffee Maker Deluxe', 89.99, 30, 3],
            ['Blender 1000W', 69.99, 25, 3],
            ['Vacuum Cleaner Robot', 299.99, 4, 3],
            ['Air Purifier HEPA', 179.99, 18, 3],
            ['LED Desk Lamp', 39.99, 50, 3],
            ['Garden Tool Set', 49.99, 6, 3],
            ['Plant Pot Ceramic Large', 24.99, 75, 3],
            ['Bedding Set Queen', 79.99, 35, 3],
            ['Kitchen Knife Set', 99.99, 22, 3],
            ['Towel Set 6pc', 44.99, 40, 3],

            // Sports (category_id: 4)
            ['Yoga Mat Premium', 34.99, 65, 4],
            ['Dumbbell Set 20kg', 89.99, 28, 4],
            ['Resistance Bands', 19.99, 100, 4],
            ['Fitness Tracker', 79.99, 45, 4],
            ['Tennis Racket', 119.99, 2, 4],
            ['Basketball Wilson', 29.99, 50, 4],
            ['Bicycle Helmet', 59.99, 32, 4],
            ['Swimming Goggles', 24.99, 80, 4],
            ['Gym Bag Large', 39.99, 9, 4],
            ['Protein Shaker', 14.99, 120, 4]
          ];

          sampleProducts.forEach(([name, price, stock, categoryId]) => {
            db.run(
              'INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)',
              [name, price, stock, categoryId],
              (err) => {
                if (err) console.error('Error inserting product:', name, err);
              }
            );
          });
        }
      });

      resolve();
    });
  });
};

module.exports = initDatabase;
