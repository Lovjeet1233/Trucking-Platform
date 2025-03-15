// controllers/truckers.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Trucker = require('../models/Trucker');
const User = require('../models/User');

// @desc    Create trucker profile
// @route   POST /api/v1/truckers
// @access  Private/Trucker
exports.createTruckerProfile = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check if trucker profile already exists
  const existingTrucker = await Trucker.findOne({ user: req.user.id });

  if (existingTrucker) {
    return next(
      new ErrorResponse('You have already created a trucker profile', 400)
    );
  }

  const trucker = await Trucker.create(req.body);

  res.status(201).json({
    success: true,
    data: trucker
  });
});

// @desc    Get trucker profile
// @route   GET /api/v1/truckers/profile
// @access  Private/Trucker
exports.getTruckerProfile = asyncHandler(async (req, res, next) => {
  const trucker = await Trucker.findOne({ user: req.user.id }).populate('user', 'name email phone');

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: trucker
  });
});

// @desc    Update trucker profile
// @route   PUT /api/v1/truckers/profile
// @access  Private/Trucker
exports.updateTruckerProfile = asyncHandler(async (req, res, next) => {
  let trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  trucker = await Trucker.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: trucker
  });
});

// @desc    Get all truckers
// @route   GET /api/v1/truckers
// @access  Private/Admin
exports.getAllTruckers = asyncHandler(async (req, res, next) => {
  const truckers = await Trucker.find().populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    count: truckers.length,
    data: truckers
  });
});

// @desc    Verify trucker
// @route   PUT /api/v1/truckers/:id/verify
// @access  Private/Admin
exports.verifyTrucker = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['verified', 'rejected'].includes(status)) {
    return next(
      new ErrorResponse('Please provide a valid verification status', 400)
    );
  }

  const trucker = await Trucker.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!trucker) {
    return next(
      new ErrorResponse(`Trucker not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: trucker
  });
});

// @desc    Update trucker location
// @route   PUT /api/v1/truckers/location
// @access  Private/Trucker
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { coordinates, address } = req.body;

  if (!coordinates || !coordinates.length === 2) {
    return next(
      new ErrorResponse('Please provide valid coordinates [longitude, latitude]', 400)
    );
  }

  const trucker = await Trucker.findOneAndUpdate(
    { user: req.user.id },
    { 
      currentLocation: {
        type: 'Point',
        coordinates,
        address: address || '',
        lastUpdated: Date.now()
      } 
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: trucker
  });
});

// @desc    Get eligible truckers based on criteria
// @route   GET /api/v1/truckers/eligible
// @access  Private/Admin/Shipper
exports.getEligibleTruckers = asyncHandler(async (req, res, next) => {
  // Get truckers with:
  // - No accidents
  // - No theft complaints
  // - Truck age < 5 years
  // - Driver's license held > 5 years
  // - Verification status is 'verified'

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const eligibleTruckers = await Trucker.find({
    'accidentHistory.hasAccidents': false,
    'theftComplaints.hasComplaints': false,
    'truck.manufactureYear': { $gte: new Date().getFullYear() - 5 },
    'drivingLicense.issueDate': { $lte: fiveYearsAgo },
    'verificationStatus': 'verified'
  }).populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    count: eligibleTruckers.length,
    data: eligibleTruckers
  });
});
