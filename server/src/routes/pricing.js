const express = require('express');
const {
  getPricing,
  updatePricing,
  calculateCosts
} = require('../controllers/pricing');

const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes with optional authentication
router.get('/', optionalAuth, getPricing);

// Semi-protected route (works for both authenticated and unauthenticated users)
// Using optionalAuth middleware to allow user identification for admin users
// but still allow unauthenticated users to access the route
router.post('/calculate', optionalAuth, calculateCosts);

// Protected routes (admin only)
router.put('/', protect, authorize('admin'), updatePricing);

module.exports = router;
