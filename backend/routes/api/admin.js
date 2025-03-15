// routes/api/admin.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSystemUsers,
  getSystemLoads,
  getSystemTransactions,
  getSystemBenefits
} = require('../../controllers/admin');
const { protect, authorize } = require('../../middleware/auth');

router.route('/dashboard')
  .get(protect, authorize('admin'), getDashboardStats);

router.route('/users')
  .get(protect, authorize('admin'), getSystemUsers);

router.route('/loads')
  .get(protect, authorize('admin'), getSystemLoads);

router.route('/transactions')
  .get(protect, authorize('admin'), getSystemTransactions);

router.route('/benefits')
  .get(protect, authorize('admin'), getSystemBenefits);

module.exports = router;