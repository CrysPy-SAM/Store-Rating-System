const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const bcrypt = require('bcrypt');

/* ================= CREATE STORE (ADMIN) ================= */
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerEmail, ownerPassword } = req.body;

    // Check if store email already exists
    const existingStore = await Store.findByEmail(email);
    if (existingStore) {
      return res.status(400).json({ message: 'Store email already exists' });
    }

    let ownerId = null;

    // If owner details provided, create store owner user
    if (ownerEmail && ownerPassword) {
      const existingOwner = await User.findByEmail(ownerEmail);
      if (existingOwner) {
        return res.status(400).json({ message: 'Owner email already exists' });
      }

      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      
      ownerId = await User.create({
        name: name, // Using store name as owner name
        email: ownerEmail,
        password: hashedPassword,
        address: address,
        role: 'store_owner'
      });
    }

    // Create the store
    const store = await Store.create({
      name,
      email,
      address,
      ownerId
    });

    // CRITICAL: Link the store to the owner in BOTH directions
    if (ownerId) {
      await User.updateStoreId(ownerId, store.id);
      console.log(`✅ Linked store owner (ID: ${ownerId}) to store (ID: ${store.id})`);
    }

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        ownerId: ownerId
      }
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ message: 'Server error' });
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
          storeIdFromToken: req.user.storeId
        }
      });
    }

    console.log(`📊 Fetching ratings for store ID: ${storeId}`);

    // Get all ratings for this store
    const ratings = await Rating.getByStoreId(storeId);
    
    console.log(`✅ Found ${ratings.length} ratings:`, ratings);
    
    // Get average rating
    const averageRating = await Rating.getAverage(storeId);

    console.log(`📈 Average rating: ${averageRating}`);

    res.json({
      success: true,
      storeId: storeId,
      ratings: ratings,
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length
    });
  } catch (err) {
    console.error('❌ Store owner ratings error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  }
};