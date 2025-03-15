// controllers/loads.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Load = require('../models/Load');
const Shipper = require('../models/Shipper');
const Trucker = require('../models/Trucker');
const Bid = require('../models/Bid');

// @desc    Create new load
// @route   POST /api/v1/loads
// @access  Private/Shipper
exports.createLoad = asyncHandler(async (req, res, next) => {
  // Get shipper profile
  const shipper = await Shipper.findOne({ user: req.user.id });

  if (!shipper) {
    return next(
      new ErrorResponse('Shipper profile not found', 404)
    );
  }

  // Add shipper to req.body
  req.body.shipper = shipper._id;

  const load = await Load.create(req.body);

  res.status(201).json({
    success: true,
    data: load
  });
});

// @desc    Get all loads
// @route   GET /api/v1/loads
// @access  Private
exports.getLoads = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Load.find(JSON.parse(queryStr))
    .populate('shipper', 'company')
    .populate('assignedTrucker', 'user')
    .populate('acceptedBid', 'amount');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Load.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const loads = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: loads.length,
    pagination,
    data: loads
  });
});

// @desc    Get single load
// @route   GET /api/v1/loads/:id
// @access  Private
exports.getLoad = asyncHandler(async (req, res, next) => {
  const load = await Load.findById(req.params.id)
    .populate('shipper', 'company')
    .populate('assignedTrucker', 'user')
    .populate('acceptedBid', 'amount');

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: load
  });
});

// @desc    Update load
// @route   PUT /api/v1/loads/:id
// @access  Private/Shipper
exports.updateLoad = asyncHandler(async (req, res, next) => {
  let load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure shipper is load owner
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to update this load`, 403)
    );
  }

  // Cannot update if load is already assigned or in progress
  if (['assigned', 'in_transit', 'delivered', 'completed'].includes(load.status)) {
    return next(
      new ErrorResponse(`Cannot update a load that is already assigned or in progress`, 400)
    );
  }

  load = await Load.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: load
  });
});

// @desc    Delete load
// @route   DELETE /api/v1/loads/:id
// @access  Private/Shipper
exports.deleteLoad = asyncHandler(async (req, res, next) => {
  const load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure shipper is load owner
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to delete this load`, 403)
    );
  }

  // Cannot delete if load is already assigned or in progress
  if (['assigned', 'in_transit', 'delivered', 'completed'].includes(load.status)) {
    return next(
      new ErrorResponse(`Cannot delete a load that is already assigned or in progress`, 400)
    );
  }

  await load.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get shipper loads
// @route   GET /api/v1/loads/shipper/me
// @access  Private/Shipper
exports.getShipperLoads = asyncHandler(async (req, res, next) => {
  const shipper = await Shipper.findOne({ user: req.user.id });

  if (!shipper) {
    return next(
      new ErrorResponse('Shipper profile not found', 404)
    );
  }

  const loads = await Load.find({ shipper: shipper._id })
    .populate('assignedTrucker', 'user')
    .populate('acceptedBid', 'amount');

  res.status(200).json({
    success: true,
    count: loads.length,
    data: loads
  });
});

// @desc    Get available loads for truckers
// @route   GET /api/v1/loads/available
// @access  Private/Trucker
exports.getAvailableLoads = asyncHandler(async (req, res, next) => {
  // Get trucker profile
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Get available loads (status: 'open', not assigned, bidding deadline not passed)
  const loads = await Load.find({
    status: 'open',
    assignedTrucker: { $exists: false },
    biddingDeadline: { $gt: Date.now() }
  }).populate('shipper', 'company');

  res.status(200).json({
    success: true,
    count: loads.length,
    data: loads
  });
});

// @desc    Assign load to trucker
// @route   PUT /api/v1/loads/:id/assign
// @access  Private/Shipper
exports.assignLoad = asyncHandler(async (req, res, next) => {
  const { bidId } = req.body;

  if (!bidId) {
    return next(
      new ErrorResponse('Please provide a bid ID', 400)
    );
  }

  // Get load
  let load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure shipper is load owner
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to assign this load`, 403)
    );
  }

  // Check if load is already assigned
  if (load.assignedTrucker) {
    return next(
      new ErrorResponse(`This load is already assigned to a trucker`, 400)
    );
  }

  // Get bid
  const bid = await Bid.findById(bidId);

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${bidId}`, 404)
    );
  }

  // Make sure bid is for this load
  if (bid.load.toString() !== load._id.toString()) {
    return next(
      new ErrorResponse(`Bid is not for this load`, 400)
    );
  }

  // Update load with assigned trucker and accepted bid
  load = await Load.findByIdAndUpdate(
    req.params.id,
    {
      assignedTrucker: bid.trucker,
      acceptedBid: bid._id,
      status: 'assigned'
    },
    {
      new: true,
      runValidators: true
    }
  );

  // Update bid status
  await Bid.findByIdAndUpdate(
    bidId,
    { status: 'accepted' },
    {
      new: true,
      runValidators: true
    }
  );

  // Reject all other bids for this load
  await Bid.updateMany(
    { load: load._id, _id: { $ne: bidId } },
    { status: 'rejected' }
  );

  res.status(200).json({
    success: true,
    data: load
  });
});

// @desc    Mark load as delivered
// @route   PUT /api/v1/loads/:id/deliver
// @access  Private/Trucker
exports.markLoadDelivered = asyncHandler(async (req, res, next) => {
  let load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Get trucker
  const trucker = await Trucker.findOne({ user: req.user.id });
  
  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Make sure trucker is assigned to this load
  if (!load.assignedTrucker || load.assignedTrucker.toString() !== trucker._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to update this load`, 403)
    );
  }

  // Make sure load is in transit
  if (load.status !== 'in_transit') {
    return next(
      new ErrorResponse(`Load must be in transit to mark as delivered`, 400)
    );
  }

  load = await Load.findByIdAndUpdate(
    req.params.id,
    { status: 'delivered' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: load
  });
});

// @desc    Mark load as completed
// @route   PUT /api/v1/loads/:id/complete
// @access  Private/Shipper
exports.markLoadCompleted = asyncHandler(async (req, res, next) => {
  let load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure shipper is load owner
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to update this load`, 403)
    );
  }

  // Make sure load is delivered
  if (load.status !== 'delivered') {
    return next(
      new ErrorResponse(`Load must be delivered to mark as completed`, 400)
    );
  }

  load = await Load.findByIdAndUpdate(
    req.params.id,
    { status: 'completed' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: load
  });
});

// @desc    Cancel load
// @route   PUT /api/v1/loads/:id/cancel
// @access  Private/Shipper
exports.cancelLoad = asyncHandler(async (req, res, next) => {
  let load = await Load.findById(req.params.id);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure shipper is load owner
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to cancel this load`, 403)
    );
  }

  // Cannot cancel if load is already completed or delivered
  if (['delivered', 'completed'].includes(load.status)) {
    return next(
      new ErrorResponse(`Cannot cancel a load that is already delivered or completed`, 400)
    );
  }

  load = await Load.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    {
      new: true,
      runValidators: true
    }
  );

  // If bids exist, mark them as rejected
  await Bid.updateMany(
    { load: load._id },
    { status: 'rejected' }
  );

  res.status(200).json({
    success: true,
    data: load
  });
});
