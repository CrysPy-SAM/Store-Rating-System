// backend/src/models/Rating.js - WITH USER EMAIL AND ADDRESS
const pool = require('../config/database');

class Rating {
  /**
   * Get all ratings for a specific store with user details
   * @param {number} storeId - The store ID
   * @returns {Promise<Array>} Array of rating objects with user details
   */
  static async getByStoreId(storeId) {
    const [rows] = await pool.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name,
        u.email,
        u.address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      `,
      [storeId]
    );
    return rows;
  }

  /**
   * Get average rating for a store
   * @param {number} storeId - The store ID
   * @returns {Promise<string>} Average rating as string with 1 decimal place
   */
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

  /**
   * Get total count of all ratings in the system
   * @returns {Promise<number>} Total count of ratings
   */
  static async getCount() {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) as count FROM ratings'
    );
    return row.count;
  }

  /**
   * Get rating distribution for a store
   * @param {number} storeId - The store ID
   * @returns {Promise<Object>} Object with rating distribution
   */
  static async getDistribution(storeId) {
    const [rows] = await pool.query(
      `
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating DESC
      `,
      [storeId]
    );
    
    // Convert to object for easy access
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    rows.forEach(row => {
      distribution[row.rating] = row.count;
    });
    
    return distribution;
  }

  /**
   * Check if user has already rated a store
   * @param {number} userId - The user ID
   * @param {number} storeId - The store ID
   * @returns {Promise<Object|null>} Rating object if exists, null otherwise
   */
  static async getUserRating(userId, storeId) {
    const [rows] = await pool.query(
      `
      SELECT id, rating, created_at
      FROM ratings
      WHERE user_id = ? AND store_id = ?
      `,
      [userId, storeId]
    );
    return rows[0] || null;
  }

  /**
   * Get all ratings by a specific user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} Array of ratings with store details
   */
  static async getByUserId(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        s.id as store_id,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      `,
      [userId]
    );
    return rows;
  }
}

module.exports = Rating;