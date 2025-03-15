// models/BenefitClaim.js
const mongoose = require('mongoose');

const BenefitClaimSchema = new mongoose.Schema({
  trucker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trucker',
    required: true
  },
  benefit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Benefit',
    required: true
  },
  claimDate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    },
    address: String
  },
  amount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  receiptImage: {
    type: String
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('BenefitClaim', BenefitClaimSchema);
