
const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateStore, handleValidationErrors } = require('../middleware/validation');


router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateStore,
  handleValidationErrors,
  storeController.createStore
);


router.get(
  '/',
  authenticate,
  storeController.getStores
);

router.get(
  '/owner/ratings',
  authenticate,
  authorize('store_owner'),
  storeController.getMyRatings
);

router.get(
  '/:id',
  authenticate,
  storeController.getStoreById
);

module.exports = router;