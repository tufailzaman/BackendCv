const jwt = require('jsonwebtoken');
const userModel = require('../Models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token'

    if (token == null) return res.sendStatus(401); // If no token, return 401

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403); // If token is not valid, return 403

        // Find the user by ID
        const foundUser = await userModel.findById(user.userId);
        if (!foundUser) return res.sendStatus(404); // User not found

        req.user = { userId: foundUser._id }; // Set user in request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
