const pool = require('../config/database');

class User {
  static async create(userData) {
    const { name, email, password, address, role, storeId } = userData;
    const query = `
      INSERT INTO users (name, email, password, address, role, store_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, address, role, store_id, created_at
    `;
    const values = [name, email, password, address, role, storeId || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, address, role, store_id FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll(filters = {}, sort = {}) {
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.store_id,
             COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.name) {
      query += ` AND u.name ILIKE $${paramCount}`;
      values.push(`%${filters.name}%`);
      paramCount++;
    }
    if (filters.email) {
      query += ` AND u.email ILIKE $${paramCount}`;
      values.push(`%${filters.email}%`);
      paramCount++;
    }
    if (filters.address) {
      query += ` AND u.address ILIKE $${paramCount}`;
      values.push(`%${filters.address}%`);
      paramCount++;
    }
    if (filters.role) {
      query += ` AND u.role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    query += ' GROUP BY u.id';

    if (sort.field) {
      const sortField = sort.field === 'rating' ? 'AVG(r.rating)' : `u.${sort.field}`;
      query += ` ORDER BY ${sortField} ${sort.order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updatePassword(userId, hashedPassword) {
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
  }

  static async getCount() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = User;