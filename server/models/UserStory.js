const mongoose = require('mongoose');

const UserStorySchema = new mongoose.Schema({
  title: String,
  author: String,
  content: String,
  imageUrl: String,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserStory', UserStorySchema);