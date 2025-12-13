const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create({ name, email, password, address, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address, role]
    );

    return {
      id: result.insertId,
      name,
      email,
      role,
    };
  }
}

module.exports = User;
