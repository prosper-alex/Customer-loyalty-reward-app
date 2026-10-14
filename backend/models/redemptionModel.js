const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reward: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reward",
            required: true
        },

        pointsUsed: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["Pending", "Completed", "Cancelled"],
            default: "Completed",
        },
    },
    {
        timestamps: true,
    }
);

const Redemption = mongoose.model("Redemption", redemptionSchema);

module.exports = Redemption;