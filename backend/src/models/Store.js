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
    try {
      let query = `
        SELECT s.id, s.name, s.email, s.address,
               COALESCE(AVG(r.rating), 0) AS rating
      `;

      // ✅ Only add user_rating subquery if userId is provided
      if (userId) {
        query += `,
               (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) AS user_rating
        `;
      } else {
        query += `, NULL AS user_rating`;
      }

      query += `
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE 1=1
      `;

      const values = [];

      // ✅ Add userId to values array first (for subquery)
      if (userId) {
        values.push(userId);
      }

      // Apply filters
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

      // Apply sorting
      const allowedSortFields = ['name', 'email', 'address', 'rating'];
      const sortField = allowedSortFields.includes(sort.field) ? sort.field : 'name';
      const sortOrder = sort.order === 'desc' ? 'DESC' : 'ASC';
      
      query += ` ORDER BY ${sortField} ${sortOrder}`;

      console.log('🔍 Store Query:', query);
      console.log('📊 Query Values:', values);

      const [rows] = await pool.query(query, values);
      
      console.log('✅ Found', rows.length, 'stores');
      
      return rows;
    } catch (error) {
      console.error('❌ Error in Store.getAll():', error);
      throw error;
    }
  }

  static async getCount() {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) as count FROM stores'
    );
    return row.count;
  }

}

module.exports = Store;