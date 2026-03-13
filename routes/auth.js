/**
 * Authentication routes
 */

const express = require('express');
const crypto = require('crypto');
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
  // Generate a cryptographically secure random state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in session or cookie (for demo, we'll use a cookie)
  res.cookie('instagram_auth_state', state, { 
    httpOnly: true, 
    maxAge: 3600000, // 1 hour
    sameSite: 'lax',
    secure: config.nodeEnv === 'production'
  });
  
  // Build the authorization URL
  const authUrl = `${config.instagram.oauthUrl}?client_id=${config.instagram.appId}&redirect_uri=${encodeURIComponent(config.instagram.redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;\n  \n  // Redirect to Instagram authorization page\n  res.redirect(authUrl);\n});\n\n/**\n * @route   GET /auth/instagram/callback\n * @desc    Handle Instagram OAuth callback\n * @access  Public\n */\nrouter.get('/instagram/callback', async (req, res) => {\n  try {\n    const { code, state, error, error_reason, error_description } = req.query;\n    \n    // Check for errors in the callback\n    if (error) {\n      return res.status(400).json({\n        status: 'error',\n        message: `Authentication error: ${error_description || error_reason || error}`\n      });\n    }\n    \n    // Verify state to prevent CSRF attacks\n    const savedState = req.cookies.instagram_auth_state;\n    if (!savedState || state !== savedState) {\n      return res.status(400).json({\n        status: 'error',\n        message: 'Invalid state parameter. Authentication failed.'\n      });\n    }\n    \n    // Clear the state cookie\n    res.clearCookie('instagram_auth_state');\n    \n    // Exchange code for access token\n    const tokenResponse = await instagramController.exchangeCodeForToken(code);\n    \n    // Get long-lived token\n    const longLivedTokenResponse = await instagramController.getLongLivedToken(tokenResponse.access_token);\n    \n    // Get user profile\n    const userProfile = await instagramController.getUserProfile(longLivedTokenResponse.access_token);\n    \n    // Create user data object\n    const userData = {\n      userId: userProfile.id,\n      username: userProfile.username,\n      accessToken: longLivedTokenResponse.access_token,\n      tokenType: longLivedTokenResponse.token_type,\n      expiresIn: longLivedTokenResponse.expires_in\n    };\n    \n    // Generate JWT token\n    const token = generateToken(userData);\n    \n    // Redirect to frontend with token using hash fragment (more secure, not logged by servers)\n    res.redirect(`/#token=${token}`);\n  } catch (error) {\n    console.error('Auth callback error:', error);\n    res.status(500).json({\n      status: 'error',\n      message: 'Authentication failed. Please try again.'\n    });\n  }\n});\n\n/**\n * @route   POST /auth/refresh-token\n * @desc    Refresh Instagram access token\n * @access  Private\n */\nrouter.post('/refresh-token', async (req, res) => {\n  try {\n    const { accessToken } = req.body;\n    \n    if (!accessToken) {\n      return res.status(400).json({\n        status: 'error',\n        message: 'Access token is required'\n      });\n    }\n    \n    // Refresh the token\n    const refreshedToken = await instagramController.refreshLongLivedToken(accessToken);\n    \n    // Clear user cache\n    if (req.user && req.user.userId) {\n      cache.clearUserCache(req.user.userId);\n    }\n    \n    res.json({\n      status: 'success',\n      data: refreshedToken\n    });\n  } catch (error) {\n    console.error('Token refresh error:', error);\n    res.status(500).json({\n      status: 'error',\n      message: 'Failed to refresh token. Please login again.'\n    });\n  }\n});\n\nmodule.exports = router;\n