const express = require('express');

const pointController = require('../controllers/pointController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/getMyPointsHistory', authorize('USER'), pointController.getMyPointsHistory);

router.get('/getAllPointsHistory', authorize('ADMIN'), pointController.getAllPointsHistory);

module.exports = router;