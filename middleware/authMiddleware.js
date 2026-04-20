const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key');

      // Get user from the token, excluding password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        console.error(`JWT Auth Failure [${error.name}]:`, error.message);
        console.log('Invalid Token Received:', token);
        return res.status(401).json({ success: false, message: 'Session expired or invalid. Please login again.' });
      } else {
        console.error(`Critical Database Error during Auth:`, error.message);
        return res.status(503).json({ success: false, message: 'Tactical Service Unavailable: Database offline.' });
      }
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.some(role => role.toLowerCase() === req.user.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
