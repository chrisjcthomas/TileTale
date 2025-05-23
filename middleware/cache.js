/**
 * Caching middleware
 * Implements a simple in-memory cache for API responses
 */

const cache = require('memory-cache');
const config = require('../config');

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in milliseconds (defaults to config value)
 */
module.exports = (duration) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a cache key from the request URL and user ID (if authenticated)
    const userId = req.user ? req.user.userId : 'anonymous';
    const key = `${userId}:${req.originalUrl || req.url}`;
    
    // Check if we have a cache hit
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      // Return cached response
      return res.json(JSON.parse(cachedResponse));
    }
    
    // Store the original send function
    const originalSend = res.json;
    
    // Override the send function to cache the response
    res.json = function(body) {
      // Cache the response
      const cacheDuration = duration || config.cache.duration;
      cache.put(key, JSON.stringify(body), cacheDuration);
      
      // Call the original send function
      originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Clear cache for a specific user
 * @param {string} userId - User ID
 */
module.exports.clearUserCache = (userId) => {
  const keys = cache.keys();
  
  keys.forEach(key => {
    if (key.startsWith(`${userId}:`)) {
      cache.del(key);
    }
  });
};

/**
 * Clear all cache
 */
module.exports.clearAllCache = () => {
  cache.clear();
};
