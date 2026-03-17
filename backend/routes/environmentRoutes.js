const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createEnvironmentalData,
  getAllEnvironmentalData,
  getEnvironmentalDataByVehicle,
} = require('../controllers/environmentController');

router.post('/',            protect, createEnvironmentalData);
router.get('/',             protect, getAllEnvironmentalData);
router.get('/:vehicleId',   protect, getEnvironmentalDataByVehicle);

module.exports = router;
