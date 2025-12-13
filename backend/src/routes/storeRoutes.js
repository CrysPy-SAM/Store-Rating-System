const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin → create store
router.post(
  '/',
  authenticate,
  authorize('admin'),
  storeController.createStore
);

// All users → view stores
router.get(
  '/',
  authenticate,
  storeController.getStores
);

// Store owner → ratings
router.get(
  '/my-ratings',
  authenticate,
  authorize('store_owner'),
  storeController.getMyRatings
);

module.exports = router;
