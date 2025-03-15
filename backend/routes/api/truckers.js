// routes/api/truckers.js
const express = require('express');
const router = express.Router();
const {
  createTruckerProfile,
  getTruckerProfile,
  updateTruckerProfile,
  getAllTruckers,
  verifyTrucker,
  updateLocation,
  getEligibleTruckers
} = require('../../controllers/truckers');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('trucker', 'admin'), createTruckerProfile)
  .get(protect, authorize('admin'), getAllTruckers);

router.route('/profile')
  .get(protect, authorize('trucker'), getTruckerProfile)
  .put(protect, authorize('trucker'), updateTruckerProfile);

router.route('/location')
  .put(protect, authorize('trucker'), updateLocation);

router.route('/eligible')
  .get(protect, authorize('admin', 'shipper'), getEligibleTruckers);

router.route('/:id/verify')
  .put(protect, authorize('admin'), verifyTrucker);

module.exports = router;
