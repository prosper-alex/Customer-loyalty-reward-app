const express = require('express');

const rewardController = require('../controllers/rewardController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// CREATE REWARD - ADMIN
router.post("/createReward", protect, authorize("ADMIN"), rewardController.createReward);

// GET AVAILABLE REWARDS - USER
router.get( "/getRewards", protect, authorize("USER"), rewardController.getRewards );

// GET ALL REWARDS - ADMIN
router.get( "/getAllRewards", protect, authorize("ADMIN"), rewardController.getAllRewards);

// REDEEM REWARD - USER
router.post("/redeemReward", protect, authorize("USER"), rewardController.redeemReward);

router.get( "/getMyRedemptionHistory", protect, authorize("USER"), rewardController.getMyRedemptionHistory );

router.get( "/getAllRedemptionHistory", protect, authorize("ADMIN"), rewardController.getAllRedemptionHistory);

router.patch("/deactivateReward/:id", protect, authorize("ADMIN"), rewardController.deactivateReward);

router.patch("/reactivateReward/:id", protect, authorize("ADMIN"), rewardController.reactivateReward);

router.patch("/toggleFeatured/:id", protect, authorize("ADMIN"), rewardController.toggleFeaturedReward);

router.get("/featured", protect, authorize("USER"), rewardController.getFeaturedRewards);

module.exports = router;