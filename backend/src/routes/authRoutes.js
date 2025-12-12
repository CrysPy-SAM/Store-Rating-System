const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUser, validatePassword, handleValidationErrors } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/signup', validateUser, handleValidationErrors, authController.signup);
router.put('/update-password', authenticate, validatePassword, handleValidationErrors, authController.updatePassword);

module.exports = router;