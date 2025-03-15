
// routes/api/bids.js
const express = require('express');
const router = express.Router();
const {
  createBid,
  getBidsForLoad,
  getTruckerBids,
  getBid,
  updateBid,
  withdrawBid,
  acceptBid,
  rejectBid
} = require('../../controllers/bids');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('trucker'), createBid);

router.route('/load/:loadId')
  .get(protect, getBidsForLoad);

router.route('/trucker/me')
  .get(protect, authorize('trucker'), getTruckerBids);

router.route('/:id')
  .get(protect, getBid)
  .put(protect, authorize('trucker'), updateBid);

router.route('/:id/withdraw')
  .put(protect, authorize('trucker'), withdrawBid);

router.route('/:id/accept')
  .put(protect, authorize('shipper'), acceptBid);

router.route('/:id/reject')
  .put(protect, authorize('shipper'), rejectBid);

module.exports = router;