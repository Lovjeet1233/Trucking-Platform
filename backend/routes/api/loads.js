// routes/api/loads.js
const express = require('express');
const router = express.Router();
const {
  createLoad,
  getLoads,
  getLoad,
  updateLoad,
  deleteLoad,
  getShipperLoads,
  getAvailableLoads,
  assignLoad,
  markLoadDelivered,
  markLoadCompleted,
  cancelLoad,
  updateLoadStatus
} = require('../../controllers/loads');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('shipper'), createLoad)
  .get(protect, getLoads);

router.route('/:id')
  .get(protect, getLoad)
  .put(protect, authorize('shipper'), updateLoad)
  .delete(protect, authorize('shipper'), deleteLoad);

router.route('/shipper/me')
  .get(protect, authorize('shipper'), getShipperLoads);

router.route('/available')
  .get(protect, authorize('trucker'), getAvailableLoads);

router.route('/:id/status')
  .put(protect, authorize('shipper'), updateLoadStatus);

router.route('/:id/assign')
  .put(protect, authorize('shipper'), assignLoad);

router.route('/:id/deliver')
  .put(protect, authorize('trucker'), markLoadDelivered);

router.route('/:id/complete')
  .put(protect, authorize('shipper'), markLoadCompleted);

router.route('/:id/cancel')
  .put(protect, authorize('shipper'), cancelLoad);

module.exports = router;