const express = require("express");

const favoriteController = require("../controllers/favoriteController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/:productId", authorize("USER"), favoriteController.addFavorite );

router.delete( "/:productId", authorize("USER"), favoriteController.removeFavorite );

router.get( "/", authorize("USER"), favoriteController.getFavorites );

module.exports = router;