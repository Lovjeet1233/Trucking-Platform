
// controllers/benefits.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Benefit = require('../models/Benefit');
const BenefitClaim = require('../models/BenefitClaim');
const Trucker = require('../models/Trucker');

// @desc    Create benefit
// @route   POST /api/v1/benefits
// @access  Private/Admin
exports.createBenefit = asyncHandler(async (req, res, next) => {
  const benefit = await Benefit.create(req.body);

  res.status(201).json({
    success: true,
    data: benefit
  });
});

// @desc    Get all benefits
// @route   GET /api/v1/benefits
// @access  Private
exports.getBenefits = asyncHandler(async (req, res, next) => {
  const benefits = await Benefit.find({ isActive: true })
    .sort({ category: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: benefits.length,
    data: benefits
  });
});

// @desc    Get benefit by ID
// @route   GET /api/v1/benefits/:id
// @access  Private
exports.getBenefitById = asyncHandler(async (req, res, next) => {
  const benefit = await Benefit.findById(req.params.id);

  if (!benefit) {
    return next(
      new ErrorResponse(`Benefit not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: benefit
  });
});

// @desc    Update benefit
// @route   PUT /api/v1/benefits/:id
// @access  Private/Admin
exports.updateBenefit = asyncHandler(async (req, res, next) => {
  let benefit = await Benefit.findById(req.params.id);

  if (!benefit) {
    return next(
      new ErrorResponse(`Benefit not found with id of ${req.params.id}`, 404)
    );
  }

  benefit = await Benefit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: benefit
  });
});

// @desc    Delete benefit
// @route   DELETE /api/v1/benefits/:id
// @access  Private/Admin
exports.deleteBenefit = asyncHandler(async (req, res, next) => {
  const benefit = await Benefit.findById(req.params.id);

  if (!benefit) {
    return next(
      new ErrorResponse(`Benefit not found with id of ${req.params.id}`, 404)
    );
  }

  await benefit.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Claim benefit
// @route   POST /api/v1/benefits/:id/claim
// @access  Private/Trucker
exports.claimBenefit = asyncHandler(async (req, res, next) => {
  const { location, amount, receiptImage, notes } = req.body;

  // Check if benefit exists
  const benefit = await Benefit.findById(req.params.id);

  if (!benefit) {
    return next(
      new ErrorResponse(`Benefit not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if benefit is active
  if (!benefit.isActive) {
    return next(
      new ErrorResponse(`This benefit is no longer active`, 400)
    );
  }

  // Get trucker profile
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Create benefit claim
  const claim = await BenefitClaim.create({
    trucker: trucker._id,
    benefit: benefit._id,
    location,
    amount,
    receiptImage,
    notes
  });

  res.status(201).json({
    success: true,
    data: claim
  });
});

// @desc    Get trucker's benefit claims
// @route   GET /api/v1/benefits/claims/me
// @access  Private/Trucker
exports.getTruckerClaims = asyncHandler(async (req, res, next) => {
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  const claims = await BenefitClaim.find({ trucker: trucker._id })
    .populate('benefit', 'name type category')
    .sort({ claimDate: -1 });

  res.status(200).json({
    success: true,
    count: claims.length,
    data: claims
  });
});

// @desc    Approve benefit claim
// @route   PUT /api/v1/benefits/claims/:id/approve
// @access  Private/Admin
exports.approveClaim = asyncHandler(async (req, res, next) => {
  let claim = await BenefitClaim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  claim = await BenefitClaim.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc    Reject benefit claim
// @route   PUT /api/v1/benefits/claims/:id/reject
// @access  Private/Admin
exports.rejectClaim = asyncHandler(async (req, res, next) => {
  let claim = await BenefitClaim.findById(req.params.id);

  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.id}`, 404)
    );
  }

  claim = await BenefitClaim.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: claim
  });
});
