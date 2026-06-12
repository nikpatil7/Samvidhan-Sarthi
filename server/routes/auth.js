const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to validate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, preferredCountry } = req.body;
    // Log incoming request body for debugging
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: username, email, or password.' });
    }
    // Check if user with email or username already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    if (username.length > 20) {
      return res.status(400).json({ message: 'Username must be 20 characters or fewer' });
    }
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      name: name || username,
      preferredCountry: preferredCountry || 'India'
    });
    try {
      await newUser.save();
    } catch (saveError) {
      console.error('User save error:', saveError);
      return res.status(500).json({ message: 'Error saving user', error: saveError.message });
    }
    // Generate token
    let token;
    try {
      token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('JWT sign error:', jwtError);
      return res.status(500).json({ message: 'Error generating token', error: jwtError.message });
    }
    // Return user info and token (exclude password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      preferredCountry: newUser.preferredCountry,
      role: newUser.role
    };
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user info and token (exclude password)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      preferredCountry: user.preferredCountry,
      role: user.role,
      profilePicture: user.profilePicture
    };
    
    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Export the router and middleware for use in other files
module.exports = router;
module.exports.authenticateToken = authenticateToken; 