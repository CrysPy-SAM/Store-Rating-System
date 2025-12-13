const pool = require('../config/database');

exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id;   // auth middleware se
    const { storeId, rating } = req.body;

    if (!storeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    res.json({ message: 'Rating submitted successfully' });

  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ message: 'Error submitting rating' });
  }
};
