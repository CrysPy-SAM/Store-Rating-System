const Rating = require('../models/Rating');
const Store = require('../models/Store');

exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Upsert rating
    const result = await Rating.create(userId, storeId, rating);

    // Optionally recalc store average (we calculate on read in Store.findById)
    const store = await Store.findById(storeId);

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: result,
      store: {
        id: store.id,
        averageRating: store.rating,
      },
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};