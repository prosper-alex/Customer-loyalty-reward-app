const User = require("../models/usermodel");
const Product = require("../models/productModel");

// Add product to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);

    if (user.favoriteProducts.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your favorites",
      });
    }

    user.favoriteProducts.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to favorites",
      data: {
        favoriteProducts: user.favoriteProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove product from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.favoriteProducts = user.favoriteProducts.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from favorites",
      data: {
        favoriteProducts: user.favoriteProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's favourites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favoriteProducts"
    );

    return res.status(200).json({
      success: true,
      data: {
        favoriteProducts: user.favoriteProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};