const EnvironmentalData = require('../models/environmentalModel');
const socketService     = require('../services/socketService');

// -------------------------------------------------------------------
// POST /api/environment  —  Store new environmental reading
// -------------------------------------------------------------------
exports.createEnvironmentalData = async (req, res) => {
  try {
    const data = await EnvironmentalData.create(req.body);

    // Real-time broadcast
    socketService.emitEnvironmentUpdate(data);

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('createEnvironmentalData error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------------
// GET /api/environment  —  Fetch all environmental data
// -------------------------------------------------------------------
exports.getAllEnvironmentalData = async (req, res) => {
  try {
    const data = await EnvironmentalData.find().sort({ timestamp: -1 }).limit(200);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getAllEnvironmentalData error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------------
// GET /api/environment/:vehicleId  —  Fetch by vehicle
// -------------------------------------------------------------------
exports.getEnvironmentalDataByVehicle = async (req, res) => {
  try {
    const data = await EnvironmentalData.find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 })
      .limit(100);

    if (!data.length) {
      return res.status(404).json({ success: false, message: 'No environmental data found for this vehicle' });
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getEnvironmentalDataByVehicle error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
