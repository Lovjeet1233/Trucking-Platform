// models/Trucker.js
const mongoose = require('mongoose');

const TruckerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  drivingLicense: {
    number: {
      type: String,
      required: [true, 'Please provide a driving license number']
    },
    issueDate: {
      type: Date,
      required: [true, 'Please provide a driving license issue date']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide a driving license expiry date']
    },
    state: String
  },
  truck: {
    registrationNumber: {
      type: String,
      required: [true, 'Please provide a truck registration number']
    },
    type: {
      type: String,
      required: [true, 'Please provide a truck type']
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide truck capacity']
    },
    manufactureYear: {
      type: Number,
      required: [true, 'Please provide manufacture year']
    }
  },
  accidentHistory: {
    hasAccidents: {
      type: Boolean,
      default: false
    },
    accidentDetails: [{
      date: Date,
      description: String,
      severity: String
    }]
  },
  theftComplaints: {
    hasComplaints: {
      type: Boolean,
      default: false
    },
    complaintDetails: [{
      date: Date,
      description: String,
      status: String
    }]
  },
  preferredRoutes: [{
    startLocation: {
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
    endLocation: {
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
    }
  }],
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline'
    },
    nextAvailableDate: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [
    {
      url: String,
      documentType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('Trucker', TruckerSchema);