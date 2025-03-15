// models/Shipper.js
const mongoose = require('mongoose');

const ShipperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Please provide a company name']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxId: {
    type: String
  },
  businessType: {
    type: String,
    enum: ['individual', 'company']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [
    {
      type: String,
      documentType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Shipper', ShipperSchema);