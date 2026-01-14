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
            ['Laptop', 999.99, 10, 1],
            ['Smartphone', 499.99, 15, 1],
            ['Headphones', 79.99, 20, 1]
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
