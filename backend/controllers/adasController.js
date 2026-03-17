const ADASData      = require('../models/adasModel');
const socketService = require('../services/socketService');

// -------------------------------------------------------------------
// POST /api/adas  —  Store new ADAS signal snapshot
// -------------------------------------------------------------------
exports.createADASData = async (req, res) => {
  try {
    const data = await ADASData.create(req.body);

    // Emit alert if any critical ADAS signal is active
    const hasAlert =
      data.aebTriggered ||
      data.laneDeparture ||
      data.blindSpotDetected ||
      data.driverDrowsiness;

    if (hasAlert) {
      socketService.emitADASAlert(data);
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('createADASData error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------------
// GET /api/adas/:vehicleId  —  Fetch ADAS data for a specific vehicle
// -------------------------------------------------------------------
exports.getADASDataByVehicle = async (req, res) => {
  try {
    const data = await ADASData.find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 })
      .limit(100);

    if (!data.length) {
      return res.status(404).json({ success: false, message: 'No ADAS data found for this vehicle' });
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getADASDataByVehicle error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
