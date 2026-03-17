const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Vehicle = require('../models/vehicleModel');
const SensorData = require('../models/sensorDataModel');
const Alert    = require('../models/alertModel');
const Driver   = require('../models/driverModel');

// GET /api/vehicles
router.get('/vehicles', protect, async (_req, res) => {
  try {
    const data = await Vehicle.find().populate('assignedDriver', 'name fatigueLevel alertnessScore');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sensor
router.get('/sensor', protect, async (_req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(200);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/alerts
router.get('/alerts', protect, async (_req, res) => {
  try {
    const data = await Alert.find().sort({ timestamp: -1 }).limit(200);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/alerts/:id/resolve
router.put('/alerts/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/drivers
router.get('/drivers', protect, async (_req, res) => {
  try {
    const data = await Driver.find();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
