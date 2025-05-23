/**
 * Instagram API Controller
 * Handles all Instagram API interactions
 */

const axios = require('axios');
const config = require('../config');
const { generateToken } = require('../middleware/auth');
const cache = require('../middleware/cache');

/**
 * Exchange authorization code for access token
 */
exports.exchangeCodeForToken = async (code) => {
  try {
    // Make POST request to Instagram API to exchange code for token
    const response = await axios.post(
      config.instagram.tokenUrl,
      {
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.instagram.redirectUri,
        code
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Return the token response
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for access token');
  }
};

/**
 * Exchange short-lived token for long-lived token
 */
exports.getLongLivedToken = async (shortLivedToken) => {
  try {
    // Make GET request to Instagram API to exchange short-lived token for long-lived token
    const response = await axios.get(
      `${config.instagram.longLivedTokenUrl}`,
      {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: config.instagram.appSecret,
          access_token: shortLivedToken
        }
      }
    );

    // Return the long-lived token response
    return response.data;
  } catch (error) {
    console.error('Error getting long-lived token:', error.response?.data || error.message);
    throw new Error('Failed to exchange for long-lived token');
  }
};

/**
 * Refresh a long-lived token
 */
exports.refreshLongLivedToken = async (token) => {
  try {
    // Make GET request to Instagram API to refresh long-lived token
    const response = await axios.get(
      `${config.instagram.longLivedTokenUrl}`,
      {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: token
        }
      }
    );

    // Return the refreshed token response
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw new Error('Failed to refresh token');
  }
};

/**
 * Get user profile information
 */
exports.getUserProfile = async (accessToken) => {
  try {
    // Make GET request to Instagram API to get user profile
    const response = await axios.get(
      `${config.instagram.apiBaseUrl}/me`,
      {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken
        }
      }
    );

    // Return the user profile
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error.response?.data || error.message);
    throw new Error('Failed to get user profile');
  }
};

/**
 * Get user media (posts)
 */
exports.getUserMedia = async (accessToken, limit = 10) => {
  try {
    // Make GET request to Instagram API to get user media
    const response = await axios.get(
      `${config.instagram.apiBaseUrl}/me/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username',
          limit,
          access_token: accessToken
        }
      }
    );

    // Return the user media
    return response.data;
  } catch (error) {
    console.error('Error getting user media:', error.response?.data || error.message);
    throw new Error('Failed to get user media');
  }
};

/**
 * Get media details by ID
 */
exports.getMediaDetails = async (mediaId, accessToken) => {
  try {
    // Make GET request to Instagram API to get media details
    const response = await axios.get(
      `${config.instagram.apiBaseUrl}/${mediaId}`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_url,media_type,thumbnail_url}',
          access_token: accessToken
        }
      }
    );

    // Return the media details
    return response.data;
  } catch (error) {
    console.error('Error getting media details:', error.response?.data || error.message);
    throw new Error('Failed to get media details');
  }
};
