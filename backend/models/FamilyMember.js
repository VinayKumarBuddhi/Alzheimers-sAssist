const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  relation: {
    type: String,
    required: [true, 'Relation is required'],
    trim: true,
    enum: ['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin', 'friend', 'other']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  isClose: {
    type: Boolean,
    default: true,
    required: [true, 'Is close field is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
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
  additionalInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional info cannot exceed 500 characters']
  },
  importantNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Important notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
familyMemberSchema.index({ userId: 1, name: 1 });
familyMemberSchema.index({ userId: 1, relation: 1 });

// Method to get public profile (without face embedding)
familyMemberSchema.methods.getPublicProfile = function() {
  const memberObject = this.toObject();
  delete memberObject.faceEmbedding;
  return memberObject;
};

// Static method to find family member by face
familyMemberSchema.statics.findByFace = async function(userId, faceEmbedding, tolerance = 0.6) {
  const familyMembers = await this.find({ userId, isActive: true });
  
  // This will be replaced by Python face recognition logic
  // For now, return the first member (placeholder)
  return familyMembers[0] || null;
};

module.exports = mongoose.model('FamilyMember', familyMemberSchema); 