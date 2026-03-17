#!/usr/bin/env node
// =========================================================================
// Seed Database — Populates MongoDB with realistic demo data for the
// Smart Automotive Monitoring system so the frontend dashboards have
// real records to display.
//
// Usage: node scripts/seedDatabase.js
// =========================================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const path     = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User                = require('../models/userModel');
const Driver              = require('../models/driverModel');
const Vehicle             = require('../models/vehicleModel');
const SensorData          = require('../models/sensorDataModel');
const EnvironmentalData   = require('../models/environmentalModel');
const ADASData            = require('../models/adasModel');
const Alert               = require('../models/alertModel');
const SafetyPrediction    = require('../models/safetyPredictionModel');
const MaintenancePrediction = require('../models/maintenancePredictionModel');

// ── Helpers ──
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Static seed data ──
const truckNames = [
  'Titan Express', 'Iron Hauler', 'Thunder Rig', 'Night Phantom',
  'Steel Voyager', 'Road Commander', 'Apex Runner', 'Storm Carrier',
  'Blue Ridge', 'Canyon King', 'Prairie Wolf', 'Dust Devil',
];
const driverNames = [
  'Arjun Mehta', 'Priya Sharma', 'Ravi Kumar', 'Neha Patel',
  'Vikram Singh', 'Anita Desai', 'Suresh Reddy', 'Kavya Iyer',
  'Rahul Verma', 'Deepa Nair', 'Anil Gupta', 'Meera Das',
];
const components = ['Brake System', 'Engine Oil', 'Transmission', 'Air Filter', 'Coolant System', 'Battery', 'Alternator', 'Suspension'];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Wipe previous seed data ──
    await Promise.all([
      User.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      SensorData.deleteMany({}),
      EnvironmentalData.deleteMany({}),
      ADASData.deleteMany({}),
      Alert.deleteMany({}),
      SafetyPrediction.deleteMany({}),
      MaintenancePrediction.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');

    // ── 1. Create users ──
    const adminUser = await User.create({
      name: 'Fleet Admin',
      email: 'admin@fleet.com',
      password: 'admin123',
      role: 'admin',
    });

    const driverUsers = [];
    for (let i = 0; i < driverNames.length; i++) {
      const u = await User.create({
        name: driverNames[i],
        email: `driver${i + 1}@fleet.com`,
        password: 'driver123',
        role: 'driver',
      });
      driverUsers.push(u);
    }
    console.log(`👤 Created 1 admin + ${driverUsers.length} driver users`);

    // ── 2. Create vehicles ──
    const vehicleDocs = [];
    for (let i = 0; i < truckNames.length; i++) {
      const vid = `VH-${String(i + 1).padStart(3, '0')}`;
      const plate = `TN-${randInt(10, 99)}-${String.fromCharCode(65 + i)}${String.fromCharCode(65 + ((i + 3) % 26))}-${randInt(1000, 9999)}`;
      const v = await Vehicle.create({
        vehicleId: vid,
        make: pick(['Tata', 'Ashok Leyland', 'Volvo', 'Eicher', 'BharatBenz']),
        model: truckNames[i],
        year: randInt(2018, 2025),
        registrationNumber: plate,
        status: pick(['active', 'active', 'active', 'maintenance']),
      });
      vehicleDocs.push(v);
    }
    console.log(`🚛 Created ${vehicleDocs.length} vehicles`);

    // ── 3. Create drivers & assign vehicles ──
    const driverDocs = [];
    for (let i = 0; i < driverUsers.length; i++) {
      const vehicleId = vehicleDocs[i % vehicleDocs.length].vehicleId;
      const d = await Driver.create({
        userId: driverUsers[i]._id,
        name: driverNames[i],
        licenseNumber: `LIC-${Date.now()}-${i}`,
        assignedVehicle: vehicleId,
        fatigueLevel: randInt(5, 80),
        alertnessScore: randInt(30, 100),
        status: pick(['active', 'active', 'on_trip']),
      });
      driverDocs.push(d);

      // Also assign driver to vehicle
      await Vehicle.findByIdAndUpdate(vehicleDocs[i % vehicleDocs.length]._id, {
        assignedDriver: d._id,
      });
    }
    console.log(`🧑‍✈️ Created ${driverDocs.length} drivers`);

    // ── 4. Sensor data (per vehicle) ──
    const sensorBulk = [];
    vehicleDocs.forEach((v) => {
      for (let j = 0; j < 5; j++) {
        sensorBulk.push({
          vehicleId: v.vehicleId,
          speed: randInt(30, 110),
          engineTemperature: randInt(75, 120),
          tirePressure: randInt(22, 38),
          fuelLevel: randInt(15, 95),
          brakeStatus: pick(['normal', 'normal', 'worn', 'critical']),
          latitude: rand(8.0, 28.0),
          longitude: rand(72.0, 88.0),
          timestamp: new Date(Date.now() - randInt(0, 3600000)),
        });
      }
    });
    await SensorData.insertMany(sensorBulk);
    console.log(`📡 Created ${sensorBulk.length} sensor records`);

    // ── 5. Environmental data (per vehicle) ──
    const envBulk = [];
    vehicleDocs.forEach((v) => {
      for (let j = 0; j < 3; j++) {
        envBulk.push({
          vehicleId: v.vehicleId,
          latitude: rand(8.0, 28.0),
          longitude: rand(72.0, 88.0),
          temperature: rand(20, 45),
          humidity: rand(30, 95),
          rainLevel: pick(['none', 'none', 'light', 'moderate', 'heavy']),
          visibility: randInt(50, 10000),
          roadCondition: pick(['dry', 'dry', 'wet', 'icy', 'flooded']),
          trafficDensity: pick(['low', 'medium', 'high', 'congested']),
          timestamp: new Date(Date.now() - randInt(0, 7200000)),
        });
      }
    });
    await EnvironmentalData.insertMany(envBulk);
    console.log(`🌦️ Created ${envBulk.length} environmental records`);

    // ── 6. ADAS data (per vehicle) ──
    const adasBulk = [];
    vehicleDocs.forEach((v) => {
      for (let j = 0; j < 3; j++) {
        adasBulk.push({
          vehicleId: v.vehicleId,
          aebTriggered: Math.random() < 0.15,
          laneDeparture: Math.random() < 0.2,
          adaptiveCruiseActive: Math.random() < 0.5,
          blindSpotDetected: Math.random() < 0.2,
          driverDrowsiness: Math.random() < 0.1,
          timestamp: new Date(Date.now() - randInt(0, 7200000)),
        });
      }
    });
    await ADASData.insertMany(adasBulk);
    console.log(`🛡️ Created ${adasBulk.length} ADAS records`);

    // ── 7. Alerts ──
    const alertTypes = ['Overload', 'Fatigue', 'Heart Rate', 'Brake Failure', 'Tire Pressure', 'Speeding', 'Accident Risk'];
    const alertMessages = {
      Overload: 'Vehicle load exceeds safe limits',
      Fatigue: 'Driver fatigue level critical — rest recommended',
      'Heart Rate': 'Abnormal heart rate pattern detected',
      'Brake Failure': 'Brake system degradation warning',
      'Tire Pressure': 'Tire pressure below safe threshold',
      Speeding: 'Speed exceeds zone limit',
      'Accident Risk': 'HIGH RISK WARNING: Elevated accident risk detected',
    };
    const alertBulk = [];
    for (let i = 0; i < 15; i++) {
      const type = pick(alertTypes);
      alertBulk.push({
        vehicleId: pick(vehicleDocs).vehicleId,
        alertType: type,
        severity: pick(['Low', 'Medium', 'High', 'Critical']),
        message: alertMessages[type],
        isResolved: Math.random() > 0.6,
        timestamp: new Date(Date.now() - randInt(60000, 10800000)),
      });
    }
    await Alert.insertMany(alertBulk);
    console.log(`🚨 Created ${alertBulk.length} alerts`);

    // ── 8. Safety Predictions ──
    const riskLevels = ['Safe', 'Warning', 'High Risk', 'Critical'];
    const safetyBulk = [];
    driverDocs.forEach((d) => {
      const score = randInt(5, 95);
      let level;
      if (score >= 80) level = 'Critical';
      else if (score >= 60) level = 'High Risk';
      else if (score >= 40) level = 'Warning';
      else level = 'Safe';

      safetyBulk.push({
        vehicleId: d.assignedVehicle,
        driverId: d._id,
        riskScore: score,
        riskLevel: level,
        contributingFactors: [pick(['High speed', 'Fatigue', 'Poor visibility', 'Wet road', 'AEB triggered'])],
        recommendedAction: level === 'Safe'
          ? 'Continue monitoring.'
          : 'Reduce speed and increase following distance.',
        timestamp: new Date(),
      });
    });
    await SafetyPrediction.insertMany(safetyBulk);
    console.log(`🎯 Created ${safetyBulk.length} safety predictions`);

    // ── 9. Maintenance Predictions ──
    const maintBulk = [];
    vehicleDocs.slice(0, 8).forEach((v, i) => {
      maintBulk.push({
        vehicleId: v.vehicleId,
        component: components[i % components.length],
        predictedFailure: new Date(Date.now() + randInt(1, 30) * 86400000),
        confidence: randInt(40, 95),
        severity: pick(['low', 'medium', 'high', 'critical']),
        recommendation: 'Schedule inspection within predicted window.',
        status: pick(['pending', 'acknowledged']),
        timestamp: new Date(),
      });
    });
    await MaintenancePrediction.insertMany(maintBulk);
    console.log(`🔧 Created ${maintBulk.length} maintenance predictions`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Admin login: admin@fleet.com / admin123');
    console.log('   Driver login: driver1@fleet.com / driver123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
