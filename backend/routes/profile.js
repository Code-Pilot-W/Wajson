const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { uploadSingle, deleteFile, getFileUrl } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      profile: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          if (key === 'socialLinks' && typeof profile[key] === 'object') {
            user.profile.socialLinks = { ...user.profile.socialLinks, ...profile[key] };
          } else {
            user.profile[key] = profile[key];
          }
        }
      });
    }

    // Update preferences
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          if (typeof preferences[key] === 'object') {
            user.preferences[key] = { ...user.preferences[key], ...preferences[key] };
          } else {
            user.preferences[key] = preferences[key];
          }
        }
      });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
});

// @route   POST /api/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/avatar', auth, uploadSingle('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image if exists
    if (user.profile.profileImage) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.profile.profileImage));
      deleteFile(oldImagePath);
    }

    // Save new image path
    user.profile.profileImage = getFileUrl(req.file.filename);
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profileImage: user.profile.profileImage
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile/avatar
// @desc    Update profile picture via URL (fallback)
// @access  Private
router.put('/avatar', auth, async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({
        success: false,
        message: 'Profile image URL is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old uploaded image if exists and it's a local file
    if (user.profile.profileImage && user.profile.profileImage.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', user.profile.profileImage);
      deleteFile(oldImagePath);
    }

    user.profile.profileImage = profileImage;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profileImage: user.profile.profileImage
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/profile/cover
// @desc    Upload cover image
// @access  Private
router.post('/cover', auth, uploadSingle('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old cover image if exists
    if (user.profile.coverImage) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.profile.coverImage));
      deleteFile(oldImagePath);
    }

    // Save new image path
    user.profile.coverImage = getFileUrl(req.file.filename);
    await user.save();

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      coverImage: user.profile.coverImage
    });

  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile/cover
// @desc    Update cover image via URL (fallback)
// @access  Private
router.put('/cover', auth, async (req, res) => {
  try {
    const { coverImage } = req.body;
    
    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Cover image URL is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old uploaded image if exists and it's a local file
    if (user.profile.coverImage && user.profile.coverImage.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', user.profile.coverImage);
      deleteFile(oldImagePath);
    }

    user.profile.coverImage = coverImage;
    await user.save();

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      coverImage: user.profile.coverImage
    });

  } catch (error) {
    console.error('Update cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/profile/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional stats
    const memberSince = user.createdAt;
    const daysSinceMember = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));
    
    const stats = {
      ...user.stats,
      memberSince: memberSince,
      daysSinceMember: daysSinceMember,
      lastLogin: user.lastLogin,
      accountAge: `${Math.floor(daysSinceMember / 365)} years, ${Math.floor((daysSinceMember % 365) / 30)} months`
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile/stats/increment
// @desc    Increment user statistics
// @access  Private
router.put('/stats/increment', auth, async (req, res) => {
  try {
    const { type } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    switch (type) {
      case 'postViewed':
        await user.incrementPostViews();
        break;
      case 'jobViewed':
        await user.incrementJobViews();
        break;
      case 'profileView':
        await user.incrementProfileViews();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid stat type'
        });
    }

    res.json({
      success: true,
      message: 'Stat updated successfully'
    });

  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/profile/avatar
// @desc    Remove profile picture
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profile.profileImage = null;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    const { emailNotifications, privacy, appearance, account } = req.body;
    
    if (emailNotifications) {
      user.preferences.emailNotifications = { ...user.preferences.emailNotifications, ...emailNotifications };
    }
    
    if (privacy) {
      user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
    }
    
    if (appearance) {
      user.preferences.appearance = { ...user.preferences.appearance, ...appearance };
    }
    
    if (account) {
      user.preferences.account = { ...user.preferences.account, ...account };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/profile/delete
// @desc    Delete user account
// @access  Private
router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
