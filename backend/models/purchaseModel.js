const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    productName: {
        type: String,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    pricePerUnit: {
        type: Number,
        required: true,
        min: 0,
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    pointsEarned: {
        type: Number,
        required: true,
        min: 0,
    },

    status: {
        type: String,
        enum: [ 'Pending','Completed', 'Cancelled'],
        default: 'Completed',
    },
},
    {
        timestamps: true,
    }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;