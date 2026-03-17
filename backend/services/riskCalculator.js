// =========================================================================
// Risk Calculation Engine
// Combines driver, vehicle, environmental, and ADAS data to produce a
// 0–100 risk score with classification, recommended action, and factors.
// =========================================================================

/**
 * @param {Object} params
 * @param {Object} params.driver        – { fatigueLevel, alertnessScore }
 * @param {Object} params.vehicle       – { speed, engineTemperature, tirePressure }
 * @param {Object} params.environment   – { roadCondition, visibility, trafficDensity }
 * @param {Object} params.adas          – { aebTriggered, laneDeparture, blindSpotDetected, driverDrowsiness }
 * @returns {{ riskScore, riskLevel, recommendedAction, contributingFactors }}
 */
function calculateRisk({ driver = {}, vehicle = {}, environment = {}, adas = {} }) {
  let riskScore = 0;
  const contributingFactors = [];

  // -----------------------------------------------------------------------
  // 1. Driver factors  (max ~25 pts)
  // -----------------------------------------------------------------------
  const fatigue    = Number(driver.fatigueLevel)   || 0;   // 0-100
  const alertness  = Number(driver.alertnessScore) ?? 100; // 0-100

  if (fatigue > 70) {
    riskScore += 15;
    contributingFactors.push('High driver fatigue level');
  } else if (fatigue > 40) {
    riskScore += 8;
    contributingFactors.push('Moderate driver fatigue');
  }

  if (alertness < 30) {
    riskScore += 10;
    contributingFactors.push('Very low driver alertness');
  } else if (alertness < 60) {
    riskScore += 5;
    contributingFactors.push('Below-average driver alertness');
  }

  // -----------------------------------------------------------------------
  // 2. Vehicle factors  (max ~25 pts)
  // -----------------------------------------------------------------------
  const speed      = Number(vehicle.speed)            || 0;
  const engineTemp = Number(vehicle.engineTemperature)|| 0;
  const tirePSI    = Number(vehicle.tirePressure)     || 35;

  if (speed > 120) {
    riskScore += 12;
    contributingFactors.push('Excessive speed (> 120 km/h)');
  } else if (speed > 90) {
    riskScore += 6;
    contributingFactors.push('High speed (> 90 km/h)');
  }

  if (engineTemp > 110) {
    riskScore += 8;
    contributingFactors.push('Engine overheating');
  } else if (engineTemp > 95) {
    riskScore += 4;
    contributingFactors.push('Elevated engine temperature');
  }

  if (tirePSI < 25) {
    riskScore += 5;
    contributingFactors.push('Low tire pressure');
  }

  // -----------------------------------------------------------------------
  // 3. Environmental factors  (max ~25 pts)
  // -----------------------------------------------------------------------
  const roadCondMap   = { dry: 0, wet: 5, snowy: 10, icy: 15, flooded: 15 };
  const trafficMap    = { low: 0, medium: 3, high: 7, congested: 10 };

  const roadRisk = roadCondMap[environment.roadCondition] ?? 0;
  if (roadRisk > 0) {
    riskScore += roadRisk;
    contributingFactors.push(`Adverse road condition: ${environment.roadCondition}`);
  }

  const visibility = Number(environment.visibility) ?? 10000;
  if (visibility < 100) {
    riskScore += 10;
    contributingFactors.push('Extremely low visibility (< 100 m)');
  } else if (visibility < 500) {
    riskScore += 5;
    contributingFactors.push('Reduced visibility (< 500 m)');
  }

  const trafficRisk = trafficMap[environment.trafficDensity] ?? 0;
  if (trafficRisk > 0) {
    riskScore += trafficRisk;
    contributingFactors.push(`Traffic density: ${environment.trafficDensity}`);
  }

  // -----------------------------------------------------------------------
  // 4. ADAS factors  (max ~25 pts)
  // -----------------------------------------------------------------------
  if (adas.aebTriggered) {
    riskScore += 15;
    contributingFactors.push('AEB (Autonomous Emergency Braking) triggered');
  }
  if (adas.laneDeparture) {
    riskScore += 5;
    contributingFactors.push('Lane departure detected');
  }
  if (adas.blindSpotDetected) {
    riskScore += 5;
    contributingFactors.push('Blind spot obstacle detected');
  }
  if (adas.driverDrowsiness) {
    riskScore += 12;
    contributingFactors.push('Driver drowsiness detected by ADAS');
  }

  // -----------------------------------------------------------------------
  // Cap score at 100
  // -----------------------------------------------------------------------
  riskScore = Math.min(Math.round(riskScore), 100);

  // -----------------------------------------------------------------------
  // Classification
  // -----------------------------------------------------------------------
  let riskLevel;
  if (riskScore >= 80)      riskLevel = 'Critical';
  else if (riskScore >= 60) riskLevel = 'High Risk';
  else if (riskScore >= 40) riskLevel = 'Warning';
  else                      riskLevel = 'Safe';

  // -----------------------------------------------------------------------
  // Recommended action
  // -----------------------------------------------------------------------
  const actionMap = {
    Safe:       'Continue monitoring. No immediate action required.',
    Warning:    'Exercise caution. Reduce speed and increase following distance.',
    'High Risk':'Pull over at the nearest safe location. Alert dispatched to fleet manager.',
    Critical:   'CRITICAL WARNING: High accident risk detected. Reduce speed immediately. Emergency services notified.',
  };

  return {
    riskScore,
    riskLevel,
    recommendedAction: actionMap[riskLevel],
    contributingFactors,
  };
}

module.exports = { calculateRisk };
