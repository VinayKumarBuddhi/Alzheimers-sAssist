const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  faceEmbedding: {
    type: [Number],
    required: [true, 'Face embedding is required'],
    validate: {
      validator: function(v) {
        return v.length === 128; // Face recognition embeddings are 128-dimensional
      },
      message: 'Face embedding must be 128-dimensional'
    }
  },
  faceImage: {
    type: String, // Base64 encoded image or file path
    required: [true, 'Face image is required']
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  fullName: {
    type: String,
    required: false,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.faceEmbedding;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 