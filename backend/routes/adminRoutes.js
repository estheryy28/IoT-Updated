const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getEnvironmentSummary,
  getFleetRisk,
  getADASSummary,
} = require('../controllers/adminController');

router.get('/environment-summary', protect, adminOnly, getEnvironmentSummary);
router.get('/fleet-risk',          protect, adminOnly, getFleetRisk);
router.get('/adas-summary',        protect, adminOnly, getADASSummary);

module.exports = router;
