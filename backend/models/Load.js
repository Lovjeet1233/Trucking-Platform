// models/Load.js
const mongoose = require('mongoose');

const LoadSchema = new mongoose.Schema({
  shipper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipper',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the load']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Please provide pickup address']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  deliveryLocation: {
    address: {
      type: String,
      required: [true, 'Please provide delivery address']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  pickupDate: {
    type: Date,
    required: [true, 'Please provide pickup date']
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Please provide delivery date']
  },
  weight: {
    type: Number,
    required: [true, 'Please provide weight']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  loadType: {
    type: String,
    required: [true, 'Please provide load type']
  },
  specialRequirements: [String],
  budget: {
    type: Number,
    required: [true, 'Please provide budget']
  },
  status: {
    type: String,
    enum: ['pending', 'open', 'assigned', 'in_transit', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTrucker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trucker'
  },
  acceptedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  biddingDeadline: {
    type: Date,
    required: [true, 'Please provide bidding deadline']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for searching loads by location and date
LoadSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
LoadSchema.index({ 'deliveryLocation.coordinates': '2dsphere' });
LoadSchema.index({ pickupDate: 1 });
LoadSchema.index({ deliveryDate: 1 });

module.exports = mongoose.model('Load', LoadSchema);