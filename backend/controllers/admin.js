
// controllers/admin.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Shipper = require('../models/Shipper');
const Trucker = require('../models/Trucker');
const Load = require('../models/Load');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Benefit = require('../models/Benefit');
const BenefitClaim = require('../models/BenefitClaim');

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get counts
  const userCount = await User.countDocuments();
  const shipperCount = await Shipper.countDocuments();
  const truckerCount = await Trucker.countDocuments();
  const loadCount = await Load.countDocuments();
  const pendingVerificationCount = await Trucker.countDocuments({ verificationStatus: 'pending' });
  
  // Get loads by status
  const openLoads = await Load.countDocuments({ status: 'open' });
  const assignedLoads = await Load.countDocuments({ status: 'assigned' });
  const inTransitLoads = await Load.countDocuments({ status: 'in_transit' });
  const deliveredLoads = await Load.countDocuments({ status: 'delivered' });
  const completedLoads = await Load.countDocuments({ status: 'completed' });
  
  // Get financial stats
  const totalTransactions = await Transaction.countDocuments();
  const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
  
  // Get recent loads
  const recentLoads = await Load.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('shipper', 'company')
    .populate('assignedTrucker', 'user');
  
  // Get pending verifications
  const pendingVerifications = await Trucker.find({ verificationStatus: 'pending' })
    .limit(5)
    .populate('user', 'name email');

  // Get pending benefit claims
  const pendingClaims = await BenefitClaim.find({ status: 'pending' })
    .limit(5)
    .populate('trucker', 'user')
    .populate('benefit', 'name');

  res.status(200).json({
    success: true,
    data: {
      counts: {
        users: userCount,
        shippers: shipperCount,
        truckers: truckerCount,
        loads: loadCount,
        pendingVerifications: pendingVerificationCount
      },
      loadStats: {
        open: openLoads,
        assigned: assignedLoads,
        inTransit: inTransitLoads,
        delivered: deliveredLoads,
        completed: completedLoads
      },
      financialStats: {
        totalTransactions,
        pendingTransactions
      },
      recentData: {
        loads: recentLoads,
        pendingVerifications,
        pendingClaims
      }
    }
  });
});

// @desc    Get all system users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getSystemUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('+password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get all system loads
// @route   GET /api/v1/admin/loads
// @access  Private/Admin
exports.getSystemLoads = asyncHandler(async (req, res, next) => {
  const loads = await Load.find()
    .populate('shipper', 'company')
    .populate('assignedTrucker', 'user')
    .populate('acceptedBid', 'amount')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: loads.length,
    data: loads
  });
});

// @desc    Get all system transactions
// @route   GET /api/v1/admin/transactions
// @access  Private/Admin
exports.getSystemTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate('user', 'name email')
    .populate('relatedLoad', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Get all system benefits
// @route   GET /api/v1/admin/benefits
// @access  Private/Admin
exports.getSystemBenefits = asyncHandler(async (req, res, next) => {
  const benefits = await Benefit.find().sort({ category: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: benefits.length,
    data: benefits
  });
});