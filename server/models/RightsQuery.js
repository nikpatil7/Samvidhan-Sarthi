const mongoose = require('mongoose');

const rightsQuerySchema = new mongoose.Schema({
  // null for unauthenticated users
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  queryText: {
    type: String,
    required: true,
    maxlength: 500
  },
  matchedTopicIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RightsQuery', rightsQuerySchema);
