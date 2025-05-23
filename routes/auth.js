/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const instagramController = require('../controllers/instagramController');
const { generateToken } = require('../middleware/auth');
const cache = require('../middleware/cache');

/**
 * @route   GET /auth/instagram
 * @desc    Redirect to Instagram authorization page
 * @access  Public
 */
router.get('/instagram', (req, res) => {
  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Store state in session or cookie (for demo, we'll use a cookie)
  res.cookie('instagram_auth_state', state, { 
    httpOnly: true, 
    maxAge: 3600000, // 1 hour
    sameSite: 'lax'
  });
  
  // Build the authorization URL
  const authUrl = `${config.instagram.oauthUrl}?client_id=${config.instagram.appId}&redirect_uri=${encodeURIComponent(config.instagram.redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
  
  // Redirect to Instagram authorization page
  res.redirect(authUrl);
});

/**
 * @route   GET /auth/instagram/callback
 * @desc    Handle Instagram OAuth callback
 * @access  Public
 */
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, state, error, error_reason, error_description } = req.query;
    
    // Check for errors in the callback
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: `Authentication error: ${error_description || error_reason || error}`
      });
    }
    
    // Verify state to prevent CSRF attacks
    const savedState = req.cookies.instagram_auth_state;
    if (!savedState || state !== savedState) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid state parameter. Authentication failed.'
      });
    }
    
    // Clear the state cookie
    res.clearCookie('instagram_auth_state');
    
    // Exchange code for access token
    const tokenResponse = await instagramController.exchangeCodeForToken(code);
    
    // Get long-lived token
    const longLivedTokenResponse = await instagramController.getLongLivedToken(tokenResponse.access_token);
    
    // Get user profile
    const userProfile = await instagramController.getUserProfile(longLivedTokenResponse.access_token);
    
    // Create user data object
    const userData = {
      userId: userProfile.id,
      username: userProfile.username,
      accessToken: longLivedTokenResponse.access_token,
      tokenType: longLivedTokenResponse.token_type,
      expiresIn: longLivedTokenResponse.expires_in
    };
    
    // Generate JWT token
    const token = generateToken(userData);
    
    // Redirect to frontend with token
    res.redirect(`/?token=${token}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed. Please try again.'
    });
  }
});

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh Instagram access token
 * @access  Private
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Access token is required'
      });
    }
    
    // Refresh the token
    const refreshedToken = await instagramController.refreshLongLivedToken(accessToken);
    
    // Clear user cache
    if (req.user && req.user.userId) {
      cache.clearUserCache(req.user.userId);
    }
    
    res.json({
      status: 'success',
      data: refreshedToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token. Please login again.'
    });
  }
});

module.exports = router;
