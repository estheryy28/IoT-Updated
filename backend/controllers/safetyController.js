const SafetyPrediction = require('../models/safetyPredictionModel');
const Alert            = require('../models/alertModel');
const { calculateRisk }= require('../services/riskCalculator');
const socketService    = require('../services/socketService');

// -------------------------------------------------------------------
// POST /api/safety/predict  —  Run risk calculation and store result
// -------------------------------------------------------------------
exports.predictRisk = async (req, res) => {
  try {
    const { vehicleId, driverId, driver, vehicle, environment, adas } = req.body;

    if (!vehicleId || !driverId) {
      return res.status(400).json({ success: false, message: 'vehicleId and driverId are required' });
    }

    // 1. Calculate risk
    const result = calculateRisk({ driver, vehicle, environment, adas });

    // 2. Persist prediction
    const prediction = await SafetyPrediction.create({
      vehicleId,
      driverId,
      riskScore:           result.riskScore,
      riskLevel:           result.riskLevel,
      contributingFactors: result.contributingFactors,
      recommendedAction:   result.recommendedAction,
    });

    // 3. Emit real-time risk prediction
    socketService.emitRiskPrediction({ vehicleId, ...result });

    // 4. Auto-generate alert if High Risk or Critical
    if (result.riskLevel === 'High Risk' || result.riskLevel === 'Critical') {
      const severity = result.riskLevel === 'Critical' ? 'Critical' : 'High';
      const alert = await Alert.create({
        vehicleId,
        alertType: 'Accident Risk',
        severity,
        message:
          severity === 'Critical'
            ? 'CRITICAL WARNING: High accident risk detected. Reduce speed immediately.'
            : `HIGH RISK WARNING: Elevated accident risk detected. ${result.recommendedAction}`,
      });

      // Emit alert in real-time
      socketService.emitAlert(alert);
    }

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    console.error('predictRisk error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------------
// GET /api/safety  —  Fetch all safety predictions
// -------------------------------------------------------------------
exports.getAllPredictions = async (req, res) => {
  try {
    const data = await SafetyPrediction.find()
      .populate('driverId', 'name licenseNumber')
      .sort({ timestamp: -1 })
      .limit(200);

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getAllPredictions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------------
// GET /api/safety/:vehicleId  —  Fetch predictions for a vehicle
// -------------------------------------------------------------------
exports.getPredictionsByVehicle = async (req, res) => {
  try {
    const data = await SafetyPrediction.find({ vehicleId: req.params.vehicleId })
      .populate('driverId', 'name licenseNumber')
      .sort({ timestamp: -1 })
      .limit(100);

    if (!data.length) {
      return res.status(404).json({ success: false, message: 'No predictions found for this vehicle' });
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getPredictionsByVehicle error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
