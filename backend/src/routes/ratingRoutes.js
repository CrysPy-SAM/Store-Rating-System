const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../middleware/validation');

router.post('/', authenticate, authorize('user'), validateRating, handleValidationErrors, ratingController.submitRating);

module.exports = router;