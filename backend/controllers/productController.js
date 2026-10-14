const Product = require("../models/productModel");

// create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, size, description, price, quantity, points } = req.body;

    // check required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      quantity === undefined ||
      points === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        data: null,
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
        data: null,
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative",
        data: null,
      });
    }

    if (!Number.isInteger(points) || points < 0) {
      return res.status(400).json({
        success: false,
        message: "Points cannot be negative",
        data: null,
      });
    }

    // check existing product
    const existingProduct = await Product.findOne({ name: name.trim() });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
        data: null,
      });
    }

    // save new product

    const product = await Product.create({
      name: name.trim(),
      size: size ? size.trim() : undefined,
      description: description.trim(),
      price,
      quantity,
      points,
      isAvailable: quantity > 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create product",
      data: null,
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "USER") {
      filter = {
        isAvailable: true,
        quantity: { $gt: 0 },
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve products",
      data: null,
    });
  }
};

// Get one product by ID
exports.getProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error retrieving product:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve product",
      data: null,
    });
  }
};

// Update product by ID
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, size, description, price, quantity, points } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (name !== undefined) {
      const existingProduct = await Product.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Another product with this name already exists",
          data: null,
        });
      }

      product.name = name.trim();
    }

    if (size !== undefined) product.size = size.trim();

    if (description !== undefined) product.description = description.trim();

    if (price !== undefined) {
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
          data: null,
        });
      }
      product.price = price;
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a non-negative integer",
          data: null,
        });
      }

      product.quantity = quantity;

      if (quantity === 0) {
        product.isAvailable = false;
      } else if (!product.isManuallyDeactivated) {
        product.isAvailable = true;
      }
    }

    if (points !== undefined) {
      if (!Number.isInteger(points) || points < 0) {
        return res.status(400).json({
          success: false,
          message: "Points cannot be negative",
          data: null,
        });
      }
      product.points = points;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update product",
      data: null,
    });
  }
};

// Deactivate product by ID
exports.deactivateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    product.isManuallyDeactivated = true;
    product.isAvailable = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to deactivate product",
      data: null,
    });
  }
};

// activate product by ID
exports.reactivateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (product.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: "Product cannot be activated because it has no stock",
        data: null,
      });
    }

    product.isManuallyDeactivated = false;
    product.isAvailable = true;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product activated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error activating product:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to activate product",
      data: null,
    });
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete product",
      data: null,
    });
  }
};
