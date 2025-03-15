// routes/api/shippers.js
const express = require('express');
const router = express.Router();
const {
  createShipperProfile,
  getShipperProfile,
  updateShipperProfile,
  getAllShippers,
  verifyShipper
} = require('../../controllers/shippers');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('shipper', 'admin'), createShipperProfile)
  .get(protect, authorize('admin'), getAllShippers);

router.route('/profile')
  .get(protect, authorize('shipper'), getShipperProfile)
  .put(protect, authorize('shipper'), updateShipperProfile);

router.route('/:id/verify')
  .put(protect, authorize('admin'), verifyShipper);

module.exports = router;