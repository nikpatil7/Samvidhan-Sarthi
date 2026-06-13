const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preTestScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  postTestScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  completedPreTest: {
    type: Boolean,
    default: false
  },
  completedPostTest: {
    type: Boolean,
    default: false
  },
  // Percentage improvement, stored to one decimal place (e.g. 42.5)
  // Formula: Math.round(((postTestScore - preTestScore) / preTestScore) * 1000) / 10
  improvement: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
