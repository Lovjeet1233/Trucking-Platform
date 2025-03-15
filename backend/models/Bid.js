// models/Bid.js
const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  load: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true
  },
  trucker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trucker',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide bid amount']
  },
  proposedPickupDate: {
    type: Date
  },
  proposedDeliveryDate: {
    type: Date
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a trucker can bid only once per load
BidSchema.index({ load: 1, trucker: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);