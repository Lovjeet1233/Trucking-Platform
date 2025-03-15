// controllers/bids.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bid = require('../models/Bid');
const Load = require('../models/Load');
const Trucker = require('../models/Trucker');

// @desc    Create a bid
// @route   POST /api/v1/bids
// @access  Private/Trucker
exports.createBid = asyncHandler(async (req, res, next) => {
  const { load, amount, proposedPickupDate, proposedDeliveryDate, notes } = req.body;

  // Check if load exists
  const loadExists = await Load.findById(load);

  if (!loadExists) {
    return next(
      new ErrorResponse(`Load not found with id of ${load}`, 404)
    );
  }

  // Check if load is open for bidding
  if (loadExists.status !== 'open' || loadExists.biddingDeadline < Date.now()) {
    return next(
      new ErrorResponse(`This load is not open for bidding`, 400)
    );
  }

  // Get trucker profile
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  // Check if already bid on this load
  const existingBid = await Bid.findOne({ load, trucker: trucker._id });

  if (existingBid) {
    return next(
      new ErrorResponse('You have already placed a bid on this load', 400)
    );
  }

  // Create bid
  const bid = await Bid.create({
    load,
    trucker: trucker._id,
    amount,
    proposedPickupDate,
    proposedDeliveryDate,
    notes
  });

  res.status(201).json({
    success: true,
    data: bid
  });
});

// @desc    Get bids for a load
// @route   GET /api/v1/bids/load/:loadId
// @access  Private
exports.getBidsForLoad = asyncHandler(async (req, res, next) => {
  const load = await Load.findById(req.params.loadId);

  if (!load) {
    return next(
      new ErrorResponse(`Load not found with id of ${req.params.loadId}`, 404)
    );
  }

  // If user is a shipper, check if they own the load
  if (req.user.role === 'shipper') {
    const shipper = await Shipper.findOne({ user: req.user.id });
    
    if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view bids for this load`, 403)
      );
    }
  }

  // If user is a trucker, they can only see their own bids
  if (req.user.role === 'trucker') {
    const trucker = await Trucker.findOne({ user: req.user.id });
    
    if (!trucker) {
      return next(
        new ErrorResponse('Trucker profile not found', 404)
      );
    }

    const bid = await Bid.findOne({ load: req.params.loadId, trucker: trucker._id })
    .populate('trucker', 'user');

    return res.status(200).json({
      success: true,
      data: bid ? [bid] : []
    });
  }

  // Admin can see all bids
  const bids = await Bid.find({ load: req.params.loadId })
    .populate('trucker', 'user')
    .sort({ amount: 1 });

  res.status(200).json({
    success: true,
    count: bids.length,
    data: bids
  });
});

// @desc    Get trucker's bids
// @route   GET /api/v1/bids/trucker/me
// @access  Private/Trucker
exports.getTruckerBids = asyncHandler(async (req, res, next) => {
  const trucker = await Trucker.findOne({ user: req.user.id });

  if (!trucker) {
    return next(
      new ErrorResponse('Trucker profile not found', 404)
    );
  }

  const bids = await Bid.find({ trucker: trucker._id })
    .populate({
      path: 'load',
      select: 'title pickupLocation deliveryLocation pickupDate deliveryDate status'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bids.length,
    data: bids
  });
});

// @desc    Get single bid
// @route   GET /api/v1/bids/:id
// @access  Private
exports.getBid = asyncHandler(async (req, res, next) => {
  const bid = await Bid.findById(req.params.id)
    .populate('trucker', 'user')
    .populate('load');

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  // Restrict access based on role
  if (req.user.role === 'shipper') {
    const shipper = await Shipper.findOne({ user: req.user.id });
    const load = await Load.findById(bid.load);
    
    if (!shipper || !load || load.shipper.toString() !== shipper._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view this bid`, 403)
      );
    }
  } else if (req.user.role === 'trucker') {
    const trucker = await Trucker.findOne({ user: req.user.id });
    
    if (!trucker || bid.trucker.toString() !== trucker._id.toString()) {
      return next(
        new ErrorResponse(`Not authorized to view this bid`, 403)
      );
    }
  }

  res.status(200).json({
    success: true,
    data: bid
  });
});

// @desc    Update bid
// @route   PUT /api/v1/bids/:id
// @access  Private/Trucker
exports.updateBid = asyncHandler(async (req, res, next) => {
  let bid = await Bid.findById(req.params.id);

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if trucker owns the bid
  const trucker = await Trucker.findOne({ user: req.user.id });
  
  if (!trucker || bid.trucker.toString() !== trucker._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to update this bid`, 403)
    );
  }

  // Cannot update if bid is already accepted or rejected
  if (['accepted', 'rejected'].includes(bid.status)) {
    return next(
      new ErrorResponse(`Cannot update a bid that has been ${bid.status}`, 400)
    );
  }

  // Check if load is still open
  const load = await Load.findById(bid.load);
  if (!load || load.status !== 'open' || load.biddingDeadline < Date.now()) {
    return next(
      new ErrorResponse(`The load is no longer open for bidding`, 400)
    );
  }

  bid = await Bid.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: bid
  });
});

// @desc    Withdraw bid
// @route   PUT /api/v1/bids/:id/withdraw
// @access  Private/Trucker
exports.withdrawBid = asyncHandler(async (req, res, next) => {
  let bid = await Bid.findById(req.params.id);

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if trucker owns the bid
  const trucker = await Trucker.findOne({ user: req.user.id });
  
  if (!trucker || bid.trucker.toString() !== trucker._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to withdraw this bid`, 403)
    );
  }

  // Cannot withdraw if bid is already accepted
  if (bid.status === 'accepted') {
    return next(
      new ErrorResponse(`Cannot withdraw a bid that has been accepted`, 400)
    );
  }

  bid = await Bid.findByIdAndUpdate(
    req.params.id,
    { status: 'withdrawn' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: bid
  });
});

// @desc    Accept bid
// @route   PUT /api/v1/bids/:id/accept
// @access  Private/Shipper
exports.acceptBid = asyncHandler(async (req, res, next) => {
  let bid = await Bid.findById(req.params.id);

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  // Get load
  const load = await Load.findById(bid.load);
  
  if (!load) {
    return next(
      new ErrorResponse(`Load not found for this bid`, 404)
    );
  }

  // Check if shipper owns the load
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to accept this bid`, 403)
    );
  }

  // Cannot accept if load is not open
  if (load.status !== 'open') {
    return next(
      new ErrorResponse(`Cannot accept bids for a load that is not open`, 400)
    );
  }

  // Cannot accept if bid is withdrawn or rejected
  if (['withdrawn', 'rejected'].includes(bid.status)) {
    return next(
      new ErrorResponse(`Cannot accept a bid that has been ${bid.status}`, 400)
    );
  }

  // Update bid status
  bid = await Bid.findByIdAndUpdate(
    req.params.id,
    { status: 'accepted' },
    {
      new: true,
      runValidators: true
    }
  );

  // Update load with assigned trucker and accepted bid
  await Load.findByIdAndUpdate(
    load._id,
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

  // Reject all other bids for this load
  await Bid.updateMany(
    { load: load._id, _id: { $ne: bid._id } },
    { status: 'rejected' }
  );

  res.status(200).json({
    success: true,
    data: bid
  });
});

// @desc    Reject bid
// @route   PUT /api/v1/bids/:id/reject
// @access  Private/Shipper
exports.rejectBid = asyncHandler(async (req, res, next) => {
  let bid = await Bid.findById(req.params.id);

  if (!bid) {
    return next(
      new ErrorResponse(`Bid not found with id of ${req.params.id}`, 404)
    );
  }

  // Get load
  const load = await Load.findById(bid.load);
  
  if (!load) {
    return next(
      new ErrorResponse(`Load not found for this bid`, 404)
    );
  }

  // Check if shipper owns the load
  const shipper = await Shipper.findOne({ user: req.user.id });
  
  if (!shipper || load.shipper.toString() !== shipper._id.toString()) {
    return next(
      new ErrorResponse(`Not authorized to reject this bid`, 403)
    );
  }

  // Cannot reject if load is not open
  if (load.status !== 'open') {
    return next(
      new ErrorResponse(`Cannot reject bids for a load that is not open`, 400)
    );
  }

  // Cannot reject if bid is already accepted
  if (bid.status === 'accepted') {
    return next(
      new ErrorResponse(`Cannot reject a bid that has been accepted`, 400)
    );
  }

  bid = await Bid.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: bid
  });
});
