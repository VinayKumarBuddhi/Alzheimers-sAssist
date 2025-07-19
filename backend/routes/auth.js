const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateFaceEmbedding } = require('../utils/faceRecognition');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, faceImage, email, fullName, dateOfBirth, emergencyContact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Generate face embedding using Python script
    const faceEmbedding = await generateFaceEmbedding(faceImage);
    if (!faceEmbedding) {
      return res.status(400).json({
        success: false,
        message: 'Could not detect face in the image. Please try again.'
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      faceEmbedding,
      faceImage,
      email,
      fullName,
      dateOfBirth,
      emergencyContact
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login with username/password
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Login with face recognition
router.post('/login-face', async (req, res) => {
  try {
    const { faceImage } = req.body;

    if (!faceImage) {
      return res.status(400).json({
        success: false,
        message: 'Face image is required'
      });
    }

    // Generate face embedding for the provided image
    const faceEmbedding = await generateFaceEmbedding(faceImage);
    if (!faceEmbedding) {
      return res.status(400).json({
        success: false,
        message: 'Could not detect face in the image. Please try again.'
      });
    }

    // Find user by face (this will use Python face recognition)
    const user = await User.findOne({ isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No matching user found'
      });
    }

    // Compare faces using Python script
    const { compareFaces } = require('../utils/faceRecognition');
    const isFaceMatch = await compareFaces(user.faceEmbedding, faceEmbedding);
    
    if (!isFaceMatch) {
      return res.status(401).json({
        success: false,
        message: 'Face not recognized. Please try again.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Face login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Face login error:', error);
    res.status(500).json({
      success: false,
      message: 'Face login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { email, fullName, dateOfBirth, emergencyContact } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (emergencyContact) user.emergencyContact = emergencyContact;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router; 