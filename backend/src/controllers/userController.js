const bcrypt = require('bcrypt');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const pool = require('../config/database');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let storeId = null;
    if (role === 'store_owner') {
      // Create store for store owner
      const store = await Store.create({ name, email, address });
      storeId = store.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
      storeId,
    });

    // Update store owner_id
    if (role === 'store_owner' && storeId) {
      await pool.query('UPDATE stores SET owner_id = $1 WHERE id = $2', [user.id, storeId]);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortField, sortOrder } = req.query;
    const filters = { name, email, address, role };
    const sort = sortField ? { field: sortField, order: sortOrder || 'asc' } : {};

    const users = await User.getAll(filters, sort);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is store owner, get their store rating
    if (user.role === 'store_owner' && user.store_id) {
      const store = await Store.findById(user.store_id);
      user.rating = store ? store.rating : 0;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, storeCount, ratingCount] = await Promise.all([
      User.getCount(),
      Store.getCount(),
      Rating.getCount(),
    ]);

    res.json({
      totalUsers: userCount,
      totalStores: storeCount,
      totalRatings: ratingCount,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};