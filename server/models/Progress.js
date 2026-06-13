const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    country: {
      type: String,
      required: true
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    quizScores: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      date: {
        type: Date,
        default: Date.now
      },
      // NEW — tags quiz score entries created for Module_Step assessments
      stepType: {
        type: String
      }
    }],
    activities: [{
      activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
      },
      completed: {
        type: Boolean,
        default: false
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      date: {
        type: Date,
        default: Date.now
      },
      // NEW — optional fields for Module_Step scenario/game interactions
      activityType: {
        type: String
      },
      scenarioIndex: {
        type: Number
      },
      chosenOptionIndex: {
        type: Number
      },
      isCorrect: {
        type: Boolean
      },
      isFirstAttempt: {
        type: Boolean
      },
      completedAt: {
        type: Date
      }
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    // NEW — per-topic scenario performance: (first-attempt-correct / total) * 100
    scenarioPerformanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    // NEW — set when the seventh Module_Step is completed
    completedAt: {
      type: Date,
      default: null
    },
    // NEW — topic mastery score based on quiz, scenario, and game performance
    topicMastery: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    gameScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },
  { timestamps: true }
);

// Create a unique compound index for user-topic-country combination
progressSchema.index({ user: 1, topic: 1, country: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress; 