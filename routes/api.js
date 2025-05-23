/**
 * API routes
 */

const express = require('express');
const router = express.Router();
const instagramController = require('../controllers/instagramController');
const { verifyToken } = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');

// Apply authentication middleware to all routes
router.use(verifyToken);

/**
 * @route   GET /api/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile', cacheMiddleware(3600000), async (req, res) => {
  try {
    const profile = await instagramController.getUserProfile(req.user.accessToken);
    
    res.json({
      status: 'success',
      data: {
        ...profile,
        // Add profile picture URL if available
        profile_picture: profile.profile_picture || 'https://via.placeholder.com/150'
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile information'
    });
  }
});

/**
 * @route   GET /api/media
 * @desc    Get user media (posts)
 * @access  Private
 */
router.get('/media', cacheMiddleware(1800000), async (req, res) => {
  try {
    // Get limit from query params, default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    const media = await instagramController.getUserMedia(req.user.accessToken, limit);
    
    res.json({
      status: 'success',
      data: media
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch media'
    });
  }
});

/**
 * @route   GET /api/media/:id
 * @desc    Get media details by ID
 * @access  Private
 */
router.get('/media/:id', cacheMiddleware(3600000), async (req, res) => {
  try {
    const mediaId = req.params.id;
    
    const mediaDetails = await instagramController.getMediaDetails(mediaId, req.user.accessToken);
    
    res.json({
      status: 'success',
      data: mediaDetails
    });
  } catch (error) {
    console.error('Media details fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch media details'
    });
  }
});

/**
 * @route   GET /api/stories
 * @desc    Get user stories (mock data for Basic Display API)
 * @access  Private
 */
router.get('/stories', cacheMiddleware(900000), async (req, res) => {
  try {
    // Note: Instagram Basic Display API doesn't provide access to stories
    // This endpoint returns mock data for demonstration purposes
    
    // In a real app with Graph API and business account, you would fetch actual stories
    
    // Generate mock stories
    const stories = [];
    for (let i = 1; i <= 10; i++) {
      stories.push({
        id: `story_${i}`,
        media_type: i % 3 === 0 ? 'VIDEO' : 'IMAGE',
        media_url: i % 3 === 0 
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : `https://picsum.photos/500/800?random=${i}`,
        timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
        username: req.user.username,
        profile_pic: `https://i.pravatar.cc/150?img=${i % 10 + 1}`,
        seen: i > 5
      });
    }
    
    res.json({
      status: 'success',
      data: {
        data: stories
      }
    });
  } catch (error) {
    console.error('Stories fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stories'
    });
  }
});

/**
 * @route   GET /api/clear-cache
 * @desc    Clear user cache
 * @access  Private
 */
router.get('/clear-cache', (req, res) => {
  try {
    // Clear cache for the authenticated user
    cacheMiddleware.clearUserCache(req.user.userId);
    
    res.json({
      status: 'success',
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache'
    });
  }
});

module.exports = router;
