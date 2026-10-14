const express = require("express");

const notificationController = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's notifications
router.get("/getMyNotifications", protect, notificationController.getMyNotifications);

// Mark all notifications as read
router.patch("/markAllNotificationsRead", protect, notificationController.markAllNotificationsRead);

// Mark one notification as read
router.patch("/markNotificationRead/:id", protect, notificationController.markNotificationRead);

router.delete("/deleteReadNotifications", protect, notificationController.deleteReadNotifications,);

module.exports = router;