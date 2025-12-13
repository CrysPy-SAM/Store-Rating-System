const pool = require('../config/database');

class Rating {
  static async getByStoreId(storeId) {
    const [rows] = await pool.query(
      `
      SELECT u.name, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      `,
      [storeId]
    );
    return rows;
  }

  static async getAverage(storeId) {
    const [[row]] = await pool.query(
      `
      SELECT COALESCE(AVG(rating), 0) as avgRating
      FROM ratings
      WHERE store_id = ?
      `,
      [storeId]
    );
    return Number(row.avgRating).toFixed(1);
  }

  static async getCount() {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) as count FROM ratings'
    );
    return row.count;
  }
}

module.exports = Rating;
