const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

/* ================= CREATE STORE ================= */
async function createStore(req, res) {
  try {
    const { name, email, address, password } = req.body;

    const exists = await Store.findByEmail(email);
    if (exists) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const store = await Store.create({ name, email, address });

    if (password) {
      const hash = await bcrypt.hash(password, 10);

      const owner = await User.create({
        name,
        email,
        password: hash,
        address,
        role: 'store_owner',
        storeId: store.id,
      });

      await pool.query(
        'UPDATE stores SET owner_id = ? WHERE id = ?',
        [owner.id, store.id]
      );
    }

    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/* ================= GET STORES ================= */
async function getStores(req, res) {
  try {
    const stores = await Store.getAll(req.query, req.user?.id || null);
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/* ================= STORE OWNER RATINGS ================= */
async function getMyRatings(req, res) {
  try {
    const storeId = req.user.storeId;
    if (!storeId) {
      return res.status(404).json({ message: 'No store linked' });
    }

    const ratings = await Rating.getByStoreId(storeId);
    const avg = await Rating.getAverage(storeId);

    res.json({ ratings, averageRating: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createStore,
  getStores,
  getMyRatings,
};
