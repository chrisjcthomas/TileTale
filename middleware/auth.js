/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user data to request
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to verify JWT token
 */
exports.verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please provide a valid token.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user data to request
    req.user = decoded;
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please login again.'
    });
  }
};

/**
 * Generate JWT token
 */
exports.generateToken = (userData) => {
  return jwt.sign(
    userData,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};
