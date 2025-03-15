
// routes/api/tracking.js
const express = require('express');
const router = express.Router();
const {
  createTrackingUpdate,
  getTrackingUpdates,
  getLatestTrackingUpdate,
  reportIssue
} = require('../../controllers/tracking');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('trucker'), createTrackingUpdate);

router.route('/load/:loadId')
  .get(protect, getTrackingUpdates);

router.route('/load/:loadId/latest')
  .get(protect, getLatestTrackingUpdate);

router.route('/load/:loadId/issue')
  .post(protect, authorize('trucker'), reportIssue);

module.exports = router;