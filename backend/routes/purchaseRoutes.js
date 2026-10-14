const express = require('express');

const purchaseController = require('../controllers/purchaseController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.post('/createPurchase', authorize('USER'), purchaseController.createPurchase);

router.get('/getMyPurchaseHistory', authorize('USER'), purchaseController.getMyPurchaseHistory);

router.get('/getAllPurchaseHistory', authorize('ADMIN'), purchaseController.getAllPurchaseHistory);

router.get('/getCustomerPurchaseHistory/:id', authorize('ADMIN'), purchaseController.getCustomerPurchaseHistory);

router.get('/getPurchaseById/:id', authorize('USER', 'ADMIN'), purchaseController.getPurchaseById);

module.exports = router;
