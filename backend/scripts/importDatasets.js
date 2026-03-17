#!/usr/bin/env node
// =========================================================================
// Dataset Import Script
// Supports CSV and JSON files for ALL collections:
//
//   Existing collections:
//     --type sensor       →  SensorData    (fleet_telematics_dataset.csv)
//     --type maintenance  →  MaintenancePrediction (vehicle_sensor_dataset.csv)
//     --type driver       →  Driver behaviour enrichment (driver_behavior_dataset.csv)
//
//   New module collections:
//     --type environment  →  EnvironmentalData
//     --type adas         →  ADASData
//     --type safety       →  SafetyPrediction
//
// Usage:
//   node scripts/importDatasets.js --type sensor      --file ./datasets/fleet_telematics_dataset.csv
//   node scripts/importDatasets.js --type maintenance --file ./datasets/vehicle_sensor_dataset.csv
//   node scripts/importDatasets.js --type driver      --file ./datasets/driver_behavior_dataset.csv
//   node scripts/importDatasets.js --type environment --file ./datasets/environmental_data.csv
//   node scripts/importDatasets.js --type adas        --file ./datasets/adas_data.csv
//   node scripts/importDatasets.js --type safety      --file ./datasets/safety_prediction_data.csv
// =========================================================================

const fs       = require('fs');
const path     = require('path');
const csv      = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Models
const SensorData            = require('../models/sensorDataModel');
const MaintenancePrediction = require('../models/maintenancePredictionModel');
const Driver                = require('../models/driverModel');
const EnvironmentalData     = require('../models/environmentalModel');
const ADASData              = require('../models/adasModel');
const SafetyPrediction      = require('../models/safetyPredictionModel');

// -------------------------------------------------------------------
// CLI argument parsing
// -------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const dataType = getArg('--type');
const filePath = getArg('--file');

if (!dataType || !filePath) {
  console.error('Usage: node importDatasets.js --type <sensor|maintenance|driver|environment|adas|safety> --file <path>');
  process.exit(1);
}

// -------------------------------------------------------------------
// Model map + per-type field transformers
// -------------------------------------------------------------------
const modelMap = {
  sensor:      SensorData,
  maintenance: MaintenancePrediction,
  driver:      Driver,
  environment: EnvironmentalData,
  adas:        ADASData,
  safety:      SafetyPrediction,
};

const Model = modelMap[dataType];
if (!Model) {
  console.error(`Unknown type "${dataType}". Must be one of: ${Object.keys(modelMap).join(', ')}`);
  process.exit(1);
}

/**
 * Transform a raw CSV/JSON row to match the Mongoose schema.
 * The fleet datasets use different column names from our models, so we
 * normalise them here.
 */
function transformRow(row) {
  switch (dataType) {
    // fleet_telematics_dataset.csv → SensorData
    case 'sensor': {
      return {
        vehicleId:        row.vehicleId        || `VEH-${Math.floor(Math.random() * 10000)}`,
        speed:            Number(row.vehicle_speed)     || Number(row.speed) || 0,
        engineTemperature:Number(row.coolant_temp)      || Number(row.engineTemperature) || 0,
        tirePressure:     Number(row.pressure)          || Number(row.tirePressure) || 0,
        fuelLevel:        Number(row.fuel_level)        || Number(row.fuelLevel) || 0,
        brakeStatus:      row.brakeStatus               || 'normal',
        timestamp:        row.timestamp                  ? new Date(row.timestamp) : new Date(),
      };
    }

    // vehicle_sensor_dataset.csv → MaintenancePrediction
    case 'maintenance': {
      return {
        vehicleId:        row.vehicleId        || `VEH-${Math.floor(Math.random() * 10000)}`,
        component:        row.component        || 'engine',
        confidence:       Number(row.load)     || Number(row.confidence) || 0,
        severity:         Number(row.failure) === 1 ? 'high' : 'low',
        recommendation:   Number(row.failure) === 1
                            ? 'Schedule immediate inspection'
                            : 'Continue monitoring',
        status:           'pending',
        timestamp:        row.timestamp ? new Date(row.timestamp) : new Date(),
      };
    }

    // driver_behavior_dataset.csv  (informational – stored as raw docs)
    case 'driver': {
      return {
        userId:           row.userId           || new mongoose.Types.ObjectId(),
        name:             row.name             || `Driver-${Math.floor(Math.random() * 1000)}`,
        licenseNumber:    row.licenseNumber     || `LIC-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        fatigueLevel:     Number(row.braking)   * 20 || 0,
        alertnessScore:   100 - (Number(row.speed_variation) * 3 || 0),
        status:           row.driver_type === 'rash' || row.driver_type === 'aggressive'
                            ? 'active' : 'active',
        timestamp:        row.timestamp ? new Date(row.timestamp) : new Date(),
      };
    }

    // Environmental data
    case 'environment': {
      return {
        vehicleId:      row.vehicleId      || `VEH-${Math.floor(Math.random() * 10000)}`,
        latitude:       Number(row.latitude)  || 0,
        longitude:      Number(row.longitude) || 0,
        temperature:    Number(row.temperature) || 0,
        humidity:       Number(row.humidity)    || 0,
        rainLevel:      row.rainLevel          || 'none',
        visibility:     Number(row.visibility) || 10000,
        roadCondition:  row.roadCondition      || 'dry',
        trafficDensity: row.trafficDensity     || 'low',
        timestamp:      row.timestamp ? new Date(row.timestamp) : new Date(),
      };
    }

    // ADAS data
    case 'adas': {
      const toBool = (v) => ['true', '1', 'yes'].includes(String(v).toLowerCase());
      return {
        vehicleId:            row.vehicleId            || `VEH-${Math.floor(Math.random() * 10000)}`,
        aebTriggered:         toBool(row.aebTriggered),
        laneDeparture:        toBool(row.laneDeparture),
        adaptiveCruiseActive: toBool(row.adaptiveCruiseActive),
        blindSpotDetected:    toBool(row.blindSpotDetected),
        driverDrowsiness:     toBool(row.driverDrowsiness),
        timestamp:            row.timestamp ? new Date(row.timestamp) : new Date(),
      };
    }

    // Safety prediction data
    case 'safety': {
      return {
        vehicleId:           row.vehicleId           || `VEH-${Math.floor(Math.random() * 10000)}`,
        driverId:            row.driverId             || new mongoose.Types.ObjectId(),
        riskScore:           Number(row.riskScore)    || 0,
        riskLevel:           row.riskLevel            || 'Safe',
        contributingFactors: row.contributingFactors
                               ? (typeof row.contributingFactors === 'string'
                                   ? row.contributingFactors.split(';')
                                   : row.contributingFactors)
                               : [],
        recommendedAction:   row.recommendedAction    || '',
        timestamp:           row.timestamp ? new Date(row.timestamp) : new Date(),
      };
    }

    default:
      return row;
  }
}

// -------------------------------------------------------------------
// File readers
// -------------------------------------------------------------------
function readJSON(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function readCSV(file) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const ext = path.extname(filePath).toLowerCase();
    let records;

    if (ext === '.json') {
      records = readJSON(filePath);
    } else if (ext === '.csv') {
      records = await readCSV(filePath);
    } else {
      console.error('Unsupported file format. Use .csv or .json');
      process.exit(1);
    }

    // Transform each row
    records = records.map(transformRow);

    console.log(`📄 Parsed ${records.length} records from ${path.basename(filePath)}`);
    console.log('   Sample:', JSON.stringify(records[0], null, 2));

    // Bulk insert
    const result = await Model.insertMany(records, { ordered: false });
    console.log(`✅ Imported ${result.length} ${dataType} records successfully`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
