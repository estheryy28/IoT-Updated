const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createADASData,
  getADASDataByVehicle,
} = require('../controllers/adasController');

router.post('/',            protect, createADASData);
router.get('/:vehicleId',   protect, getADASDataByVehicle);

module.exports = router;
