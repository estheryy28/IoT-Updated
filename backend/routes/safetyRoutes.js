const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  predictRisk,
  getAllPredictions,
  getPredictionsByVehicle,
} = require('../controllers/safetyController');

router.post('/predict',      protect, predictRisk);
router.get('/',              protect, getAllPredictions);
router.get('/:vehicleId',    protect, getPredictionsByVehicle);

module.exports = router;
