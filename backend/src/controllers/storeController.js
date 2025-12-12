const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const pool = require('../config/database');
const bcrypt = require('bcrypt');

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    const existingStore = await Store.findByEmail(email);
    if (existingStore) {
      return res.status(400).json({ message: 'Store email already registered' });
    }

    const store = await Store.create({ name, email, address });

    // Create store owner user if password provided
    let owner = null;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      owner = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        role: 'store_owner',
        storeId: store.id,
      });

      // Update store with owner_id
      await pool.query('UPDATE stores SET owner_id = $1 WHERE id = $2', [owner.id, store.id]);
    }

    res.status(201).json({
      message: 'Store created successfully',
      store,
      owner: owner ? { id: owner.id, email: owner.email } : null,
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, address, email, sortField, sortOrder } = req.query;
    const userId = req.user && req.user.role === 'user' ? req.user.id : null;

    const filters = { name, address, email };
    const sort = sortField ? { field: sortField, order: sortOrder || 'asc' } : {};

    const stores = await Store.getAll(filters, sort, userId);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStoreDetails = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStoreRatings = async (req, res) => {
  try {
    const storeId = req.user && req.user.storeId;
    if (!storeId) {
      return res.status(404).json({ message: 'Store not found for this user' });
    }

    const ratings = await Store.getRatingsByStoreId(storeId);
    const store = await Store.findById(storeId);

    res.json({
      ratings,
      averageRating: store.rating,
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};