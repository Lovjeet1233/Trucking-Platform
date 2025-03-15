
// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedLoad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load'
  },
  type: {
    type: String,
    enum: ['payment', 'payout', 'refund', 'fee', 'benefit'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);