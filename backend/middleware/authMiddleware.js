const jwt = require('jsonwebtoken');

const User = require('../models/usermodel');

// Create Protect Middleware

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please provide a valid token',
                data: null
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('firstName lastName email phone role pointsBalance totalPointsEarned profilePhoto isActive isEmailVerified referralCode +passwordChangedAt');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists',
                data: null
            });
        }

        if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
            return res.status(401).json({
                success: false,
                message: 'Password recently changed. Please login again',
                data: null
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated',
                data: null
            })
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            data: null
        })
    }
};


module.exports = protect;