const pool = require('../config/database');

class Rating {
  static async create(userId, storeId, rating) {
    const query = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [userId, storeId, rating]);
    return result.rows[0];
  }

  static async getCount() {
    const result = await pool.query('SELECT COUNT(*) FROM ratings');
    return parseInt(result.rows[0].count, 10);
  }

  static async getUserRating(userId, storeId) {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2';
    const result = await pool.query(query, [userId, storeId]);
    return result.rows[0];
  }
}

module.exports = Rating;