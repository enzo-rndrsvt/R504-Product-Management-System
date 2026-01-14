const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUserData = (userData) => {
  const errors = [];

  if (!userData.username || userData.username.trim().length === 0) {
    errors.push('Username is required');
  } else if (userData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!userData.firstname || userData.firstname.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!userData.lastname || userData.lastname.trim().length === 0) {
    errors.push('Last name is required');
  }

  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

exports.registerUser = (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  // Validate input
  const validation = validateUserData({ username, password, firstname, lastname });

  if (!validation.isValid) {
    return res.status(400).json({
      error: validation.errors.join(', '),
      errors: validation.errors
    });
  }

  const database = db.getDb();

  // Check if username already exists
  database.get('SELECT id FROM users WHERE username = ?', [username], (err, existingUser) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error checking username availability' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    database.run(
      `INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)`,
      [username.trim(), hashedPassword, firstname.trim(), lastname.trim()],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID }, 'your-super-secret-key-that-should-not-be-hardcoded', {
          expiresIn: 86400
        });

        res.status(201).json({ auth: true, token });
      }
    );
  });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const database = db.getDb();

  database.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error on the server.' });
    }

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id }, 'your-super-secret-key-that-should-not-be-hardcoded', { expiresIn: 86400 });

    res.status(200).json({
      auth: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  });
};

exports.getAllUsers = (req, res) => {
  const database = db.getDb();

  database.all(`SELECT id, username, firstname, lastname, created_at FROM users`, [], (err, users) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error getting users' });
    }
    res.json(users);
  });
};

exports.findSimilarUsernames = (req, res) => {
  const database = db.getDb();

  database.all('SELECT username FROM users', [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });

    const similar = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const username1 = users[i].username.toLowerCase();
        const username2 = users[j].username.toLowerCase();

        const matrix = [];
        for (let x = 0; x <= username1.length; x++) {
          matrix[x] = [x];
        }
        for (let y = 0; y <= username2.length; y++) {
          matrix[0][y] = y;
        }

        for (let x = 1; x <= username1.length; x++) {
          for (let y = 1; y <= username2.length; y++) {
            if (username1.charAt(x - 1) === username2.charAt(y - 1)) {
              matrix[x][y] = matrix[x - 1][y - 1];
            } else {
              matrix[x][y] = Math.min(matrix[x - 1][y - 1] + 1, matrix[x][y - 1] + 1, matrix[x - 1][y] + 1);
            }
          }
        }

        const distance = matrix[username1.length][username2.length];
        if (distance <= 2) {
          similar.push({ user1: users[i].username, user2: users[j].username, distance });
        }
      }
    }

    res.json({ similar, totalComparisons: (users.length * (users.length - 1)) / 2 });
  });
};
