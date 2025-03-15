// controllers/shippers.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Shipper = require('../models/Shipper');
const User = require('../models/User');

// @desc    Create shipper profile
// @route   POST /api/v1/shippers
// @access  Private/Shipper
exports.createShipperProfile = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check if shipper profile already exists
  const existingShipper = await Shipper.findOne({ user: req.user.id });

  if (existingShipper) {
    return next(
      new ErrorResponse('You have already created a shipper profile', 400)
    );
  }

  const shipper = await Shipper.create(req.body);

  res.status(201).json({
    success: true,
    data: shipper
  });
});

// @desc    Get shipper profile
// @route   GET /api/v1/shippers/profile
// @access  Private/Shipper
exports.getShipperProfile = asyncHandler(async (req, res, next) => {
  const shipper = await Shipper.findOne({ user: req.user.id }).populate('user', 'name email phone');

  if (!shipper) {
    return next(
      new ErrorResponse('Shipper profile not found', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: shipper
  });
});

// @desc    Update shipper profile
// @route   PUT /api/v1/shippers/profile
// @access  Private/Shipper
exports.updateShipperProfile = asyncHandler(async (req, res, next) => {
  let shipper = await Shipper.findOne({ user: req.user.id });

  if (!shipper) {
    return next(
      new ErrorResponse('Shipper profile not found', 404)
    );
  }

  shipper = await Shipper.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: shipper
  });
});

// @desc    Get all shippers
// @route   GET /api/v1/shippers
// @access  Private/Admin
exports.getAllShippers = asyncHandler(async (req, res, next) => {
  const shippers = await Shipper.find().populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    count: shippers.length,
    data: shippers
  });
});

// @desc    Verify shipper
// @route   PUT /api/v1/shippers/:id/verify
// @access  Private/Admin
exports.verifyShipper = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['verified', 'rejected'].includes(status)) {
    return next(
      new ErrorResponse('Please provide a valid verification status', 400)
    );
  }

  const shipper = await Shipper.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!shipper) {
    return next(
      new ErrorResponse(`Shipper not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: shipper
  });
});