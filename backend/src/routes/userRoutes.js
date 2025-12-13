const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin dashboard stats
router.get(
  '/dashboard-stats',
  authenticate,
  authorize('admin'),
  userController.getDashboardStats
);

// Create user (admin)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  userController.createUser
);

// Get all users (admin)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  userController.getUsers
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  userController.getUserById
);

module.exports = router;
