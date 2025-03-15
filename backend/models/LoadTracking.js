
// models/LoadTracking.js
const mongoose = require('mongoose');

const LoadTrackingSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'delayed', 'issue_reported'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  },
  notes: {
    type: String
  },
  estimatedArrival: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LoadTracking', LoadTrackingSchema);