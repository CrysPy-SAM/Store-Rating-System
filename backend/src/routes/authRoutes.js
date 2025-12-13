const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');


// Login
router.post('/login', authController.login);

// Signup
router.post('/signup', authController.signup);

// Update password
router.put(
  '/update-password',
  authenticate,
  authController.updatePassword
);

module.exports = router;
