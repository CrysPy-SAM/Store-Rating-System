// backend/src/controllers/storeController.js - COMPLETE FIX
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const bcrypt = require('bcrypt');

/* ================= CREATE STORE (ADMIN) ================= */
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerEmail, ownerPassword } = req.body;

    // Validate required fields
    if (!name || !email || !address || !ownerEmail || !ownerPassword) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, address, ownerEmail, ownerPassword' 
      });
    }

    // Check if store email already exists
    const existingStore = await Store.findByEmail(email);
    if (existingStore) {
      return res.status(400).json({ message: 'Store email already exists' });
    }

    // Check if owner email already exists
    const existingOwner = await User.findByEmail(ownerEmail);
    if (existingOwner) {
      return res.status(400).json({ message: 'Owner email already exists' });
    }

    // Validate that emails are different
    if (email === ownerEmail) {
      return res.status(400).json({ 
        message: 'Store email and owner email must be different' 
      });
    }

    // Hash owner password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    
    // Create store owner user
    const ownerId = await User.create({
      name: name, // Using store name as owner name
      email: ownerEmail,
      password: hashedPassword,
      address: address,
      role: 'store_owner'
    });

    console.log(`✅ Created store owner user with ID: ${ownerId}`);

    // Create the store
    const store = await Store.create({
      name,
      email,
      address,
      ownerId
    });

    console.log(`✅ Created store with ID: ${store.id}`);

    // CRITICAL: Link the store to the owner in users table
    await User.updateStoreId(ownerId, store.id);
    console.log(`✅ Linked store owner (ID: ${ownerId}) to store (ID: ${store.id})`);

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: ownerId
      },
      owner: {
        id: ownerId,
        email: ownerEmail,
        message: 'Owner can now login with this email'
      }
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
  }
};

/* ================= GET ALL STORES ================= */
exports.getStores = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      address: req.query.address
    };

    const sort = {
      field: req.query.sortBy || 'name',
      order: req.query.sortOrder || 'asc'
    };

    // Pass userId for normal users to get their ratings
    const userId = req.user.role === 'user' ? req.user.id : null;

    const stores = await Store.getAll(filters, sort, userId);

    res.json(stores);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET STORE OWNER'S RATINGS ================= */
exports.getMyRatings = async (req, res) => {
  try {
    console.log('🔍 Store Owner Request:', {
      userId: req.user.id,
      role: req.user.role,
      storeId: req.user.storeId
    });

    const storeId = req.user.storeId;

    if (!storeId) {
      console.error('❌ Store ID is missing for user:', req.user.id);
      return res.status(400).json({ 
        message: 'Store not linked to this owner. Please contact admin.',
        debug: {
          userId: req.user.id,
          storeIdFromToken: req.user.storeId,
          suggestion: 'Admin may need to run fixStoreOwners.js script'
        }
      });
    }

    console.log(`📊 Fetching ratings for store ID: ${storeId}`);

    // Get all ratings for this store with user details
    const ratings = await Rating.getByStoreId(storeId);
    
    console.log(`✅ Found ${ratings.length} ratings`);
    
    // Get average rating
    const averageRating = await Rating.getAverage(storeId);

    console.log(`📈 Average rating: ${averageRating}`);

    // Get rating distribution
    const distribution = await Rating.getDistribution(storeId);

    res.json({
      success: true,
      storeId: storeId,
      ratings: ratings,
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      distribution: distribution
    });
  } catch (err) {
    console.error('❌ Store owner ratings error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
  }
};

/* ================= GET STORE BY ID (Optional - for future use) ================= */
exports.getStoreById = async (req, res) => {
  try {
    const storeId = req.params.id;
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get ratings if user is authenticated
    let ratings = null;
    let averageRating = 0;
    
    if (req.user) {
      ratings = await Rating.getByStoreId(storeId);
      averageRating = await Rating.getAverage(storeId);
    }

    res.json({
      store,
      ratings,
      averageRating: parseFloat(averageRating),
      totalRatings: ratings ? ratings.length : 0
    });
  } catch (err) {
    console.error('Get store by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};