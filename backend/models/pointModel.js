const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        type: {
            type: String,
            enum: ['Earned', 'Redeemed', 'Adjusted'],
            required: true,
        },

        points: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            required: true,
        },

        purchase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase',
        },
},
    { timestamps: true }
);

const Point = mongoose.model("Point", pointSchema);

module.exports = Point;

