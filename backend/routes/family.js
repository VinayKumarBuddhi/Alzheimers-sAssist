const express = require('express');
const FamilyMember = require('../models/FamilyMember');
const { generateFaceEmbedding, compareFaces } = require('../utils/faceRecognition');
const auth = require('../middleware/auth');

const router = express.Router();

// Add new family member
router.post('/add', auth, async (req, res) => {
  try {
    const { name, relation, mobile, isClose, address, faceImage, additionalInfo, importantNotes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !relation || !mobile || !address || !faceImage) {
      return res.status(400).json({
        success: false,
        message: 'Name, relation, mobile, address, and face image are required'
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

    // Check if family member with same name already exists
    const existingMember = await FamilyMember.findOne({ userId, name, isActive: true });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A family member with this name already exists'
      });
    }

    // Create new family member
    const familyMember = new FamilyMember({
      userId,
      name,
      relation,
      mobile,
      isClose: isClose !== undefined ? isClose : true,
      address,
      faceEmbedding,
      faceImage,
      additionalInfo,
      importantNotes
    });

    await familyMember.save();

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      familyMember: familyMember.getPublicProfile()
    });

  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add family member',
      error: error.message
    });
  }
});

// Retrieve family member by face
router.post('/retrieve', auth, async (req, res) => {
  try {
    const { faceImage } = req.body;
    const userId = req.user._id;

    if (!faceImage) {
      return res.status(400).json({
        success: false,
        message: 'Face image is required'
      });
    }
    console.log("face image received");

    // Generate face embedding for the provided image
    const faceEmbedding = await generateFaceEmbedding(faceImage);
    if (!faceEmbedding) {
      return res.status(400).json({
        success: false,
        message: 'Could not detect face in the image. Please try again.'
      });
    }
    console.log("face embedding generated");

    // Get all family members for the user
    const familyMembers = await FamilyMember.find({ userId, isActive: true });
    
    if (familyMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No family members found'
      });
    }
    console.log(familyMembers.length, "family members found");

    // Find matching family member using Python face recognition
    let bestMatch = null;
    let bestScore = 0.5; // Minimum threshold for face matching
    
    for (const member of familyMembers) {
      console.log(`Comparing with member: ${member._id}, name: ${member.name}`);
      const isMatch = await compareFaces(member.faceEmbedding, faceEmbedding);
      console.log(`Comparison result for member ${member._id}:`, isMatch);
      if (isMatch.similarity_score > bestScore) {
        console.log("found similar face",isMatch.similarity_score);
        bestMatch = member;
        bestScore = isMatch.similarity_score;
        console.log(`New best match: ${member._id} with score: ${isMatch.similarity_score}`);
      }
    }

    if (bestMatch==null) {
      console.log('No matching family member found');
      return res.status(404).json({
        success: false,
        message: 'No matching family member found'
      });
    }

    // Update last seen
    console.log(`Best match found: ${bestMatch._id}, updating lastSeen.`);
    bestMatch.lastSeen = new Date();
    await bestMatch.save();

    res.json({
      success: true,
      message: 'Family member found',
      familyMember: bestMatch.getPublicProfile(),
      confidence: bestScore
    });

  } catch (error) {
    console.error('Retrieve family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve family member',
      error: error.message
    });
  }
});

// Get all family members
router.get('/all', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { relation, isClose } = req.query;

    // Build query
    const query = { userId, isActive: true };
    if (relation) query.relation = relation;
    if (isClose !== undefined) query.isClose = isClose === 'true';

    const familyMembers = await FamilyMember.find(query)
      .sort({ name: 1 })
      .select('-faceEmbedding');

    res.json({
      success: true,
      count: familyMembers.length,
      familyMembers
    });

  } catch (error) {
    console.error('Get all family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family members',
      error: error.message
    });
  }
});

// Get family member by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const familyMember = await FamilyMember.findOne({ _id: id, userId, isActive: true });
    
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.json({
      success: true,
      familyMember: familyMember.getPublicProfile()
    });

  } catch (error) {
    console.error('Get family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family member',
      error: error.message
    });
  }
});

// Update family member
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, relation, mobile, isClose, address, additionalInfo, importantNotes } = req.body;

    const familyMember = await FamilyMember.findOne({ _id: id, userId, isActive: true });
    
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Update fields
    if (name) familyMember.name = name;
    if (relation) familyMember.relation = relation;
    if (mobile) familyMember.mobile = mobile;
    if (isClose !== undefined) familyMember.isClose = isClose;
    if (address) familyMember.address = address;
    if (additionalInfo !== undefined) familyMember.additionalInfo = additionalInfo;
    if (importantNotes !== undefined) familyMember.importantNotes = importantNotes;

    await familyMember.save();

    res.json({
      success: true,
      message: 'Family member updated successfully',
      familyMember: familyMember.getPublicProfile()
    });

  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family member',
      error: error.message
    });
  }
});

// Delete family member (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const familyMember = await FamilyMember.findOne({ _id: id, userId, isActive: true });
    
    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    familyMember.isActive = false;
    await familyMember.save();

    res.json({
      success: true,
      message: 'Family member deleted successfully'
    });

  } catch (error) {
    console.error('Delete family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete family member',
      error: error.message
    });
  }
});

// Search family members by name
router.get('/search/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.user._id;

    const familyMembers = await FamilyMember.find({
      userId,
      isActive: true,
      name: { $regex: name, $options: 'i' } // Case-insensitive search
    }).select('-faceEmbedding');

    res.json({
      success: true,
      count: familyMembers.length,
      familyMembers
    });

  } catch (error) {
    console.error('Search family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search family members',
      error: error.message
    });
  }
});

module.exports = router; 