// routes/api/financial.js
const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus
} = require('../../controllers/financial');
const { protect, authorize } = require('../../middleware/auth');

router.route('/')
  .post(protect, authorize('admin'), createTransaction);

router.route('/user/me')
  .get(protect, getUserTransactions);

router.route('/:id')
  .get(protect, getTransactionById);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateTransactionStatus);

module.exports = router;
