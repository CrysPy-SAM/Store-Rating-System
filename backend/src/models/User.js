const pool = require('../config/database');

class User {
 
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

 
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role, store_id FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

 
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role, store_id FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }


  static async create(data) {
    const { name, email, password, address, role } = data;
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, address, role]
    );
    return result.insertId;
  }


  static async updatePassword(userId, hashedPassword) {
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  }


  static async updateStoreId(userId, storeId) {
    const [result] = await pool.query(
      'UPDATE users SET store_id = ? WHERE id = ?',
      [storeId, userId]
    );
    console.log(`✅ Updated user ${userId} with store_id ${storeId}`);
    return result;
  }

  
  static async getCount() {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    return rows[0].count;
  }
}

module.exports = User;