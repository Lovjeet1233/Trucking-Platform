// controllers/tracking.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const LoadTracking = require('../models/LoadTracking');
const Load = require('../models/Load');
const Trucker = require('../models/Trucker');
const Shipper = require('../models/Shipper');

// @desc    Create tracking update
// @route   POST /api/v1/tracking
// @access  Private/Trucker
exports.createTrackingUpdate = asyncHandler(async (req, res, next) => {
  const { load, status, location, notes, estimatedArrival } = req.body;

  // Check if load exists
  const loadExists = await Load.findById(load);

  if (!loadExists) {
    return next(
      new ErrorResponse(`Load not found with id of ${load}`, 404)
    );
  }

  // Get trucker profile
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Check if trucker is assigned to this load
  if (!loadExists.assignedTrucker || loadExists.assignedTrucker.toString() !== trucker._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to update tracking for this load`, 403)
    );
  }

  // Update load status if needed
  if (status === 'picked_up' && loadExists.status === 'assigned') {
    await Load.findByIdAndUpdate(
      load,
      { status: 'in_transit' },
      {
        new: true,
        runValidators: true
      }
    );
  } else if (status === 'delivered' && loadExists.status === 'in_transit') {
    await Load.findByIdAndUpdate(
      load,
      { status: 'delivered' },
      {
        new: true,
        runValidators: true
      }
    );
  }

  // Create tracking update
  const tracking = await LoadTracking.create({
    load,
    trucker: trucker._id,
    status,
    location,
    notes,
    estimatedArrival
  });

  res.status(201).json({
    success: true,
    data: tracking
  });
});

// @desc    Get tracking updates for a load
// @route   GET /api/v1/tracking/load/:loadId
// @access  Private
exports.getTrackingUpdates = asyncHandler(async (req, res, next) => {
  const load = await Load.findById(req.params.loadId);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.loadId}`, 404)
    );
  }

  // Check if user is authorized
  if (req.user.role === 'shipper') {
    const shipper = await Shipper.findOne({ user: req.user.id });
    
    if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view tracking for this load`, 403)
      );
    }
  } else if (req.user.role === 'trucker') {
    const trucker = await Trucker.findOne({ user: req.user.id });
    
    if (!trucker || !load.assignedTrucker || load.assignedTrucker.toString() !== trucker._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view tracking for this load`, 403)
      );
    }
  }

  const trackingUpdates = await LoadTracking.find({ load: req.params.loadId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: trackingUpdates.length,
    data: trackingUpdates
  });
});

// @desc    Get latest tracking update for a load
// @route   GET /api/v1/tracking/load/:loadId/latest
// @access  Private
exports.getLatestTrackingUpdate = asyncHandler(async (req, res, next) => {
  const load = await Load.findById(req.params.loadId);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.loadId}`, 404)
    );
  }

  // Check if user is authorized
  if (req.user.role === 'shipper') {
    const shipper = await Shipper.findOne({ user: req.user.id });
    
    if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view tracking for this load`, 403)
      );
    }
  } else if (req.user.role === 'trucker') {
    const trucker = await Trucker.findOne({ user: req.user.id });
    
    if (!trucker || !load.assignedTrucker || load.assignedTrucker.toString() !== trucker._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view tracking for this load`, 403)
      );
    }
  }

  const latestUpdate = await LoadTracking.findOne({ load: req.params.loadId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: latestUpdate
  });
});

// @desc    Report issue with load
// @route   POST /api/v1/tracking/load/:loadId/issue
// @access  Private/Trucker
exports.reportIssue = asyncHandler(async (req, res, next) => {
  const { notes, location } = req.body;

  const load = await Load.findById(req.params.loadId);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.loadId}`, 404)
    );
  }

  // Get trucker profile
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Check if trucker is assigned to this load
  if (!load.assignedTrucker || load.assignedTrucker.toString() !== trucker._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to report issues for this load`, 403)
    );
  }

  // Create issue tracking update
  const tracking = await LoadTracking.create({
    load: load._id,
    trucker: trucker._id,
    status: 'issue_reported',
    location,
    notes
  });

  res.status(201).json({
    success: true,
    data: tracking
  });
});
