const express = require('express');
const router  = express.Router();
const { protect, driverOnly } = require('../middleware/authMiddleware');
const { getDriverSafetyStatus } = require('../controllers/driverController');

router.get('/safety-status/:driverId', protect, driverOnly, getDriverSafetyStatus);

module.exports = router;
