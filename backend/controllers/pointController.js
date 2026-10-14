const Point = require("../models/pointModel");

// GET MY POINTS HISTORY - USER
exports.getMyPointsHistory = async (req, res) => {
    try {
        const transactions = await Point.find({
            user: req.user._id,
        })
            .populate("purchase", "product productName quantity pricePerUnit totalPrice pointsEarned status")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your points history retrieved successfully",
            data: {
                transactions,
            },
        });
    } catch (error) {
        console.error("Error getting points history:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve points history",
            data: null,
        });
    }
};

// GET ALL POINTS HISTORY - ADMIN
exports.getAllPointsHistory = async (req, res) => {
    try {
        const transactions = await Point.find()
            .populate("user", "firstName lastName email")
            .populate("purchase", "product productName quantity pricePerUnit totalPrice pointsEarned status")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All points history retrieved successfully",
            data: {
                transactions,
            },
        });
    } catch (error) {
        console.error("Error getting all points history:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve points history",
            data: null,
        });
    }
};