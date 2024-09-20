const jwt = require('jsonwebtoken');
const tokenModel = require('../Models/TokenModel'); // Ensure correct path

// Middleware to verify JWT token and check if the token exists in the database
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified || !verified.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    // Attach user information from the token payload to the request
    req.user = { id: verified.userId };

    // Check if the token is present in the tokenModel
    const tokenExists = await tokenModel.findOne({ token });

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Authentication failed. Invalid token.',
    });
  }
};

module.exports = verifyToken;
