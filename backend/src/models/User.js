const pool = require('../config/database');

class User {
  // Get all users (admin only)
  static async getAll(filters = {}) {
    let query = `
      SELECT id, name, email, address, role, store_id
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      query += ' AND address LIKE ?';
      params.push(`%${filters.address}%`);
    }

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Find user by email (login / signup)
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create user
  static async create(data) {
    const { name, email, password, address, role } = data;
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, address, role]
    );
    return result.insertId;
  }

  // Update password
  static async updatePassword(userId, hashedPassword) {
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  }

  // Update store_id for store owner
  static async updateStoreId(userId, storeId) {
    await pool.query(
      'UPDATE users SET store_id = ? WHERE id = ?',
      [storeId, userId]
    );
  }

  // Count users (admin dashboard)
  static async getCount() {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    return rows[0].count;
  }
}

module.exports = User;