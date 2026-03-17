const Driver           = require('../models/driverModel');
const SafetyPrediction = require('../models/safetyPredictionModel');
const EnvironmentalData= require('../models/environmentalModel');
const ADASData         = require('../models/adasModel');

// ===================================================================
// GET /api/driver/safety-status/:driverId
// ===================================================================
exports.getDriverSafetyStatus = async (req, res) => {
  try {
    const { driverId } = req.params;

    // 1. Resolve driver → vehicle
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const vehicleId = driver.assignedVehicle;

    if (!vehicleId) {
      return res.status(404).json({ success: false, message: 'No vehicle assigned to this driver' });
    }

    // 2. Latest safety prediction
    const latestPrediction = await SafetyPrediction.findOne({ vehicleId })
      .sort({ timestamp: -1 });

    // 3. Latest environmental data
    const latestEnvironment = await EnvironmentalData.findOne({ vehicleId })
      .sort({ timestamp: -1 });

    // 4. Latest ADAS data
    const latestADAS = await ADASData.findOne({ vehicleId })
      .sort({ timestamp: -1 });

    // 5. Compose environment summary
    const environmentSummary = latestEnvironment
      ? {
          temperature:    latestEnvironment.temperature,
          humidity:       latestEnvironment.humidity,
          rainLevel:      latestEnvironment.rainLevel,
          visibility:     latestEnvironment.visibility,
          roadCondition:  latestEnvironment.roadCondition,
          trafficDensity: latestEnvironment.trafficDensity,
        }
      : null;

    // 6. Compose ADAS warnings
    const adasWarnings = latestADAS
      ? {
          aebTriggered:      latestADAS.aebTriggered,
          laneDeparture:     latestADAS.laneDeparture,
          blindSpotDetected: latestADAS.blindSpotDetected,
          driverDrowsiness:  latestADAS.driverDrowsiness,
        }
      : null;

    res.json({
      success: true,
      data: {
        driverName:        driver.name,
        vehicleId,
        riskScore:         latestPrediction?.riskScore ?? null,
        riskLevel:         latestPrediction?.riskLevel ?? 'N/A',
        recommendedAction: latestPrediction?.recommendedAction ?? 'No prediction available',
        environmentSummary,
        adasWarnings,
      },
    });
  } catch (error) {
    console.error('getDriverSafetyStatus error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
