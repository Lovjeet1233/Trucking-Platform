// models/Benefit.js
const mongoose = require('mongoose');

const BenefitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide benefit name'],
    unique: true
  },
  type: {
    type: String,
    enum: ['insurance', 'discount', 'service'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  discount: {
    type: Number
  },
  category: {
    type: String,
    enum: ['tire', 'spare_part', 'service', 'lodging', 'food', 'fuel'],
    required: true
  },
  provider: {
    name: String,
    contact: String,
    website: String
  },
  eligibility: {
    criteria: String
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Benefit', BenefitSchema);