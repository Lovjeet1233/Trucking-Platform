// routes/api/benefits.js
const express = require('express');
const router = express.Router();
const {
  createBenefit,
  getBenefits,
  getBenefitById,
  updateBenefit,
  deleteBenefit,
  claimBenefit,
  getTruckerClaims,
  approveClaim,
  rejectClaim
} = require('../../controllers/benefits');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('admin'), createBenefit)
  .get(protect, getBenefits);

router.route('/:id')
  .get(protect, getBenefitById)
  .put(protect, authorize('admin'), updateBenefit)
  .delete(protect, authorize('admin'), deleteBenefit);

router.route('/:id/claim')
  .post(protect, authorize('trucker'), claimBenefit);

router.route('/claims/me')
  .get(protect, authorize('trucker'), getTruckerClaims);

router.route('/claims/:id/approve')
  .put(protect, authorize('admin'), approveClaim);

router.route('/claims/:id/reject')
  .put(protect, authorize('admin'), rejectClaim);

module.exports = router;