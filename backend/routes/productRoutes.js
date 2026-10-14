const express = require('express');

const productController = require('../controllers/productController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin routes
router.post('/createProduct', protect, authorize('ADMIN'), productController.createProduct);

router.get('/getAllProducts', protect, authorize('USER', 'ADMIN'), productController.getAllProducts);

router.get('/getProduct/:id', protect, authorize('USER', 'ADMIN'), productController.getProduct);

router.patch('/updateProduct/:id', protect, authorize('ADMIN'), productController.updateProduct);

router.patch('/deactivateProduct/:id', protect, authorize('ADMIN'), productController.deactivateProduct);

router.patch('/reactivateProduct/:id', protect, authorize('ADMIN'), productController.reactivateProduct);

router.delete('/deleteProduct/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;