const EnvironmentalData  = require('../models/environmentalModel');
const SafetyPrediction   = require('../models/safetyPredictionModel');
const ADASData           = require('../models/adasModel');

// ===================================================================
// GET /api/admin/environment-summary
// ===================================================================
exports.getEnvironmentSummary = async (_req, res) => {
  try {
    // Average temperature & humidity across all readings
    const [agg] = await EnvironmentalData.aggregate([
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$temperature' },
          avgHumidity:    { $avg: '$humidity' },
          count:          { $sum: 1 },
        },
      },
    ]);

    // Rain distribution
    const rainDistribution = await EnvironmentalData.aggregate([
      { $group: { _id: '$rainLevel', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);

    // Road condition stats
    const roadConditionStats = await EnvironmentalData.aggregate([
      { $group: { _id: '$roadCondition', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);

    // Visibility warnings (< 500 m)
    const visibilityWarnings = await EnvironmentalData.countDocuments({ visibility: { $lt: 500 } });

    res.json({
      success: true,
      data: {
        averageTemperature: agg ? +agg.avgTemperature.toFixed(2) : null,
        averageHumidity:    agg ? +agg.avgHumidity.toFixed(2) : null,
        totalReadings:      agg ? agg.count : 0,
        rainDistribution,
        roadConditionStats,
        visibilityWarnings,
      },
    });
  } catch (error) {
    console.error('getEnvironmentSummary error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================================================================
// GET /api/admin/fleet-risk
// ===================================================================
exports.getFleetRisk = async (_req, res) => {
  try {
    // Latest prediction per vehicle
    const latestPerVehicle = await SafetyPrediction.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: '$vehicleId',
          riskScore: { $first: '$riskScore' },
          riskLevel: { $first: '$riskLevel' },
          timestamp: { $first: '$timestamp' },
        },
      },
    ]);

    // Risk distribution
    const distribution = { Safe: 0, Warning: 0, 'High Risk': 0, Critical: 0 };
    latestPerVehicle.forEach((v) => {
      if (distribution[v.riskLevel] !== undefined) distribution[v.riskLevel]++;
    });

    res.json({
      success: true,
      data: {
        vehicles: latestPerVehicle,
        riskDistribution: distribution,
      },
    });
  } catch (error) {
    console.error('getFleetRisk error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================================================================
// GET /api/admin/adas-summary
// ===================================================================
exports.getADASSummary = async (_req, res) => {
  try {
    const aebTriggers      = await ADASData.countDocuments({ aebTriggered: true });
    const laneDepartures   = await ADASData.countDocuments({ laneDeparture: true });
    const drowsinessAlerts = await ADASData.countDocuments({ driverDrowsiness: true });
    const blindSpotEvents  = await ADASData.countDocuments({ blindSpotDetected: true });
    const totalRecords     = await ADASData.countDocuments();

    res.json({
      success: true,
      data: {
        totalRecords,
        aebTriggers,
        laneDepartures,
        drowsinessAlerts,
        blindSpotEvents,
      },
    });
  } catch (error) {
    console.error('getADASSummary error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
