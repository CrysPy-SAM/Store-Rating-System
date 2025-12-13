const pool = require('../config/database');

class Store {

  static async create({ name, email, address, ownerId = null }) {
    const [result] = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, address, ownerId]
    );

    return {
      id: result.insertId,
      name,
      email,
      address,
      owner_id: ownerId
    };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(AVG(r.rating), 0) AS rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM stores WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async getAll(filters = {}, sort = {}, userId = null) {
    let query = `
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) AS rating,
             ${userId ? `(SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id)` : 'NULL'} AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const values = [];

    if (userId) values.push(userId);

    if (filters.name) {
      query += ` AND s.name LIKE ?`;
      values.push(`%${filters.name}%`);
    }

    if (filters.address) {
      query += ` AND s.address LIKE ?`;
      values.push(`%${filters.address}%`);
    }

    if (filters.email) {
      query += ` AND s.email LIKE ?`;
      values.push(`%${filters.email}%`);
    }

    query += ` GROUP BY s.id`;

    if (sort.field) {
      query += ` ORDER BY ${sort.field} ${sort.order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const [rows] = await pool.query(query, values);
    return rows;
  }

  static async getCount() {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) as count FROM stores'
    );
    return row.count;
  }

}

module.exports = Store;