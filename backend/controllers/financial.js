
// controllers/financial.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Create transaction
// @route   POST /api/v1/financial
// @access  Private/Admin
exports.createTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Get user transactions
// @route   GET /api/v1/financial/user/me
// @access  Private
exports.getUserTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await Transaction.find({ user: req.user.id })
    .populate('relatedLoad', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Get transaction by ID
// @route   GET /api/v1/financial/:id
// @access  Private
exports.getTransactionById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('relatedLoad', 'title')
    .populate('user', 'name email');

  if (!transaction) {
    return next(
      new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized
  if (req.user.role !== 'admin' && transaction.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to view this transaction`, 403)
    );
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Update transaction status
// @route   PUT /api/v1/financial/:id/status
// @access  Private/Admin
exports.updateTransactionStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
    return next(
      new ErrorResponse('Please provide a valid status', 400)
    );
  }

  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(
      new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404)
    );
  }

  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: transaction
  });
});
