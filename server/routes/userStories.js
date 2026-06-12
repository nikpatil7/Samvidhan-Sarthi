const express = require('express');
const router = express.Router();
const UserStory = require('../models/UserStory');


// GET /api/user-stories
router.get('/', async (req, res) => {
    try {
      const stories = await UserStory.find()
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: stories.length,
        data: stories
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
  
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stories'
      });
    }
  });



  // GET /api/user-stories/:id
router.get('/:id', async (req, res) => {
    try {
      const story = await UserStory.findById(req.params.id);
  
      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: story
      });
    } catch (error) {
      console.error('Error fetching story:', error);
  
      res.status(500).json({
        success: false,
        message: 'Failed to fetch story'
      });
    }
  });