const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUser, handleValidationErrors } = require('../middleware/validation');

router.get('/dashboard-stats', authenticate, authorize('admin'), userController.getDashboardStats);
router.post('/', authenticate, authorize('admin'), validateUser, handleValidationErrors, userController.createUser);
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);

module.exports = router;