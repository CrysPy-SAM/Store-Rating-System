const pool = require('../config/database');

class Store {
  static async create(storeData) {
    const { name, email, address, ownerId } = storeData;
    const query = `
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, email, address, ownerId || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, COALESCE(AVG(r.rating), 0) as rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM stores WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getAll(filters = {}, sort = {}, userId = null) {
    let query = `
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) as rating,
             ${userId ? `(
               SELECT rating FROM ratings WHERE user_id = $1 AND store_id = s.id
             ) as user_rating` : 'NULL as user_rating'}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const values = userId ? [userId] : [];
    let paramCount = userId ? 2 : 1;

    if (filters.name) {
      query += ` AND s.name ILIKE $${paramCount}`;
      values.push(`%${filters.name}%`);
      paramCount++;
    }
    if (filters.address) {
      query += ` AND s.address ILIKE $${paramCount}`;
      values.push(`%${filters.address}%`);
      paramCount++;
    }
    if (filters.email) {
      query += ` AND s.email ILIKE $${paramCount}`;
      values.push(`%${filters.email}%`);
      paramCount++;
    }

    query += ' GROUP BY s.id';

    if (sort.field) {
      const sortField = sort.field === 'rating' ? 'AVG(r.rating)' : `s.${sort.field}`;
      query += ` ORDER BY ${sortField} ${sort.order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getCount() {
    const result = await pool.query('SELECT COUNT(*) FROM stores');
    return parseInt(result.rows[0].count, 10);
  }

  static async getRatingsByStoreId(storeId) {
    const query = `
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows;
  }
}

module.exports = Store;