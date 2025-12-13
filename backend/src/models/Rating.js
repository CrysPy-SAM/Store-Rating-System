// backend/src/models/Rating.js
const pool = require('../config/database');

class Rating {

  static async create(userId, storeId, rating) {
    const query = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating)
    `;

    await pool.query(query, [userId, storeId, rating]);

    const [rows] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    return rows[0];
  }

  static async getCount() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM ratings'
    );
    return rows[0].count;
  }

  static async getUserRating(userId, storeId) {
    const [rows] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    return rows[0];
  }
}

module.exports = Rating;
