// backend/src/routes/storeRoutes.js - WITH VALIDATION
const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateStore, handleValidationErrors } = require('../middleware/validation');

// Admin → create store (WITH VALIDATION)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateStore,
  handleValidationErrors,
  storeController.createStore
);

// All authenticated users → view stores
router.get(
  '/',
  authenticate,
  storeController.getStores
);

// Store owner → get their store's ratings
router.get(
  '/owner/ratings',
  authenticate,
  authorize('store_owner'),
  storeController.getMyRatings
);

// Optional: Get single store by ID (for future use)
router.get(
  '/:id',
  authenticate,
  storeController.getStoreById
);

module.exports = router;