

const express = require('express');


const authController = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');


const upload = require("../middleware/upload");

const router = express.Router();

// USERS

router.post('/createUser', authController.createUser);

// router.post('/verifyEmail', authController.verifyEmail);

// router.post('/resendVerificationCode', authController.resendVerificationCode);

router.post('/loginUser', authController.loginUser);

router.post('/forgotPassword', authController.forgotPassword);

router.post('/resetPassword', authController.resetPassword);

router.patch( "/uploadProfilePhoto", protect, upload.single("profilePhoto"), authController.uploadProfilePhoto);

router.get('/getUser', protect, authController.getUser);

router.get('/getAllUsers', protect, authorize('ADMIN'), authController.getAllUsers);

router.patch('/updateUser', protect, authController.updateUser);

router.patch('/changePassword', protect, authController.changePassword);

router.patch('/deactivateAccount', protect, authorize('USER'), authController.deactivateAccount);

router.patch('/deactivateUser/:id', protect, authorize('ADMIN'), authController.deactivateUser);

router.patch('/activateUser/:id', protect, authorize('ADMIN'), authController.activateUser);

module.exports = router;