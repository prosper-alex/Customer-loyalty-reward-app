const mongoose = require("mongoose");

const Purchase = require("../models/purchaseModel");

const Product = require("../models/productModel");

const Point = require("../models/pointModel");

const User = require("../models/usermodel");

const Notification = require("../models/notificationModel");

// Create a new purchase
exports.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { productId, quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    // Check required fields
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
        data: null,
      });
    }

    // check quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
        data: null,
      });
    }

    session.startTransaction();

    // Find the product by ID
    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (!product.isAvailable) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable",
        data: null,
      });
    }

    // check stock
    if (product.quantity < quantity) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} item(s) are available`,
        data: null,
      });
    }

    // Check if the user exists
    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const isFirstPurchase = !(await Purchase.exists({
      user: user._id,
    }).session(session));

    // Calculate the total price and points earned

    const totalPrice = product.price * quantity;
    const pointsEarned = product.points * quantity;

    // Create the purchase

    const purchase = new Purchase({
      user: req.user._id,
      product: productId,
      productName: product.name,
      quantity,
      pricePerUnit: product.price,
      totalPrice,
      pointsEarned,
      status: "Completed",
    });
    // Reduce the product quantity in stock
    product.quantity -= quantity;

    // Automatically mark the product unavailable when stock runs out.
    // Do not mark it as manually deactivated.
    if (product.quantity === 0) {
      product.isAvailable = false;
      product.isManuallyDeactivated = false;
    }
    // Add new points to the user's points balance
    if (
      user.totalPointsEarned === undefined ||
      user.totalPointsEarned === null
    ) {
      user.totalPointsEarned = 0;
    }

    // Add new points to the user's points balance
    user.pointsBalance += pointsEarned;
    user.totalPointsEarned += pointsEarned;

    let referralBonusPoint = null;

    if (isFirstPurchase && user.referredBy && !user.referralRewardReceived) {
      const referrer = await User.findById(user.referredBy).session(session);

      if (referrer) {
        referrer.pointsBalance += 100;
        referrer.totalPointsEarned += 100;

        referralBonusPoint = new Point({
          user: referrer._id,
          type: "Earned",
          points: 100,
          description: `Referral bonus for referring ${user.firstName} ${user.lastName}`,
        });

        user.referralRewardReceived = true;

        await referrer.save({ session });
      }
    }

    // Record points transaction
    const point = new Point({
      user: user._id,
      type: "Earned",
      points: pointsEarned,
      description: `Points earned from purchase of ${product.name}`,
      purchase: purchase._id,
    });

    await purchase.save({ session });
    await product.save({ session });
    await user.save({ session });
    await point.save({ session });
    if (referralBonusPoint) {
      await referralBonusPoint.save({ session });
    }
    await session.commitTransaction();
    try {
      await Notification.create({
        user: user._id,
        title: "Purchase successful!",
        body: `You earned ${pointsEarned} points from your purchase of ${product.name}.`,
      });
    } catch (notificationError) {
      console.error(
        "Purchase completed, but notification creation failed:",
        notificationError.message,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: {
        purchase,
        point,
        pointsBalance: user.pointsBalance,
        totalPointsEarned: user.totalPointsEarned,
        quantity: product.quantity,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Error creating purchase:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete purchase",
      data: null,
    });
  } finally {
    session.endSession();
  }
};

// Get purchase history for the logged-in user

exports.getMyPurchaseHistory = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate("product", "name size description price points")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      data: { purchases },
    });
  } catch (error) {
    console.error("Error getting purchase history:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase history",
      data: null,
    });
  }
};

// Get all purchases (Admin only)
exports.getAllPurchaseHistory = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate(
        "user",
        "firstName lastName email phone pointsBalance isActive isEmailVerified",
      )
      .populate("product", "name size price points")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all purchases",
      data: null,
    });
  }
};

// Get a specific user purchase by ID (Admin only)
exports.getCustomerPurchaseHistory = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const purchases = await Purchase.find({ user: user.id })
      .populate("product", "name size price points")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Purchase retrieved successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          pointsBalance: user.pointsBalance,
        },
        purchases,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase",
      data: null,
    });
  }
};

// get a specific purchase by ID (Admin only)
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate(
        "user",
        "firstName lastName email phone pointsBalance isActive isEmailVerified",
      )
      .populate("product", "name size quantity price points");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
        data: null,
      });
    }

    if (
      req.user.role === "USER" &&
      purchase.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this purchase",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("Error getting purchase:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase",
      data: null,
    });
  }
};
