const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['lesson', 'quiz', 'game', 'article', 'video'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 5
    },
    points: {
      type: Number,
      default: 10
    },
    quiz: {
      questions: [{
        question: {
          type: String
        },
        options: [{
          text: String,
          isCorrect: Boolean
        }],
        explanation: {
          type: String
        },
        // NEW — classifies the question; legacy documents default to 'recall'
        questionType: {
          type: String,
          enum: ['recall', 'application'],
          default: 'recall'
        }
      }]
    },
    gameConfig: {
      type: mongoose.Schema.Types.Mixed
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // NEW — one of seven Module_Step identifiers; absent on legacy documents
    moduleStep: {
      type: String,
      enum: [
        'why-it-matters',
        'real-life-scenario',
        'constitutional-concept',
        'case-example',
        'interactive-assessment',
        'reinforcement-activity',
        'key-takeaways',
        'pre-test',
        'post-test'
      ],
      default: undefined
    },
    // NEW — marks content as validated for plain language
    plainLanguageValidated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create a compound index for efficient querying
contentSchema.index({ topic: 1, type: 1, order: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 