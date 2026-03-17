#!/usr/bin/env node
// =========================================================================
// Live Data Simulator
// Streams fake real-time sensor, environmental, and ADAS data to the
// backend APIs every few seconds, making the dashboard look like a
// live running truck fleet system.
//
// Usage:
//   node scripts/dataSimulator.js
//
// The backend must be running. The simulator authenticates as admin,
// then periodically POSTs data for random vehicles. Socket.io events
// fire automatically, so the dashboard updates in real time.
// =========================================================================

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5001;
const BASE = `http://localhost:${PORT}`;

// ── Helpers ──
const rand  = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port: PORT, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Vehicle IDs (must match seeded data) ──
const vehicleIds = Array.from({ length: 12 }, (_, i) => `VH-${String(i + 1).padStart(3, '0')}`);

// ── Indian truck route coordinates (lat/lng waypoints) ──
const routes = [
  { lat: 13.08, lng: 80.27 },  // Chennai
  { lat: 12.97, lng: 77.59 },  // Bangalore
  { lat: 17.38, lng: 78.49 },  // Hyderabad
  { lat: 19.08, lng: 72.88 },  // Mumbai
  { lat: 28.61, lng: 77.21 },  // Delhi
  { lat: 22.57, lng: 88.36 },  // Kolkata
  { lat: 26.85, lng: 80.95 },  // Lucknow
  { lat: 23.02, lng: 72.57 },  // Ahmedabad
  { lat: 11.02, lng: 76.97 },  // Coimbatore
  { lat: 15.36, lng: 75.12 },  // Hubli
  { lat: 21.17, lng: 72.83 },  // Surat
  { lat:  9.93, lng: 76.26 },  // Kochi
];

// Track live positions for each vehicle
const livePositions = {};
vehicleIds.forEach((vid, i) => {
  const r = routes[i % routes.length];
  livePositions[vid] = { lat: r.lat, lng: r.lng };
});

// ── Data Generators ──

function generateSensorData(vid) {
  const pos = livePositions[vid];
  // Simulate movement
  pos.lat += rand(-0.005, 0.005);
  pos.lng += rand(-0.005, 0.005);

  return {
    vehicleId: vid,
    speed: randInt(25, 105),
    engineTemperature: randInt(72, 118),
    tirePressure: randInt(24, 38),
    fuelLevel: randInt(10, 95),
    brakeStatus: pick(['normal', 'normal', 'normal', 'worn', 'critical']),
    latitude: pos.lat,
    longitude: pos.lng,
    timestamp: new Date().toISOString(),
  };
}

function generateEnvironmentalData(vid) {
  const pos = livePositions[vid];
  return {
    vehicleId: vid,
    latitude: pos.lat,
    longitude: pos.lng,
    temperature: rand(22, 42).toFixed(1),
    humidity: rand(35, 90).toFixed(1),
    rainLevel: pick(['none', 'none', 'none', 'light', 'moderate', 'heavy']),
    visibility: randInt(100, 10000),
    roadCondition: pick(['dry', 'dry', 'dry', 'wet', 'icy', 'flooded']),
    trafficDensity: pick(['low', 'low', 'medium', 'high', 'congested']),
    timestamp: new Date().toISOString(),
  };
}

function generateADASData(vid) {
  return {
    vehicleId: vid,
    aebTriggered: Math.random() < 0.05,     // rare — 5% chance
    laneDeparture: Math.random() < 0.12,
    adaptiveCruiseActive: Math.random() < 0.4,
    blindSpotDetected: Math.random() < 0.1,
    driverDrowsiness: Math.random() < 0.06,  // rare
    timestamp: new Date().toISOString(),
  };
}

// ── Main loop ──
(async () => {
  console.log('🚀 Smart Automotive — Live Data Simulator');
  console.log('   Authenticating...');

  // 1. Login as admin
  let token;
  try {
    const loginRes = await post('/api/auth/login', {
      email: 'admin@fleet.com',
      password: 'admin123',
    });
    token = loginRes.token;
    if (!token) throw new Error('No token returned');
    console.log('   ✅ Authenticated as admin');
  } catch (err) {
    console.error('   ❌ Login failed:', err.message);
    console.error('   Make sure the backend is running and the database is seeded.');
    process.exit(1);
  }

  console.log(`   Streaming data for ${vehicleIds.length} vehicles...\n`);

  let tick = 0;

  const interval = setInterval(async () => {
    tick++;

    // Pick 2-4 random vehicles to update per tick
    const count = randInt(2, 5);
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(pick(vehicleIds));
    }
    const unique = [...new Set(selected)];

    for (const vid of unique) {
      try {
        // Always send sensor data
        const sensor = generateSensorData(vid);
        await post('/api/environment', generateEnvironmentalData(vid), token);

        // Environment data every other tick
        if (tick % 2 === 0) {
          await post('/api/environment', generateEnvironmentalData(vid), token);
        }

        // ADAS data every 3rd tick
        if (tick % 3 === 0) {
          const adas = generateADASData(vid);
          await post('/api/adas', adas, token);

          // If ADAS signals fire, run a safety prediction
          if (adas.aebTriggered || adas.laneDeparture || adas.driverDrowsiness || adas.blindSpotDetected) {
            await post('/api/safety/predict', {
              vehicleId: vid,
              driverId: '000000000000000000000000', // placeholder
              driver: {
                fatigueLevel: randInt(10, 80),
                alertnessScore: randInt(30, 95),
              },
              vehicle: {
                speed: sensor.speed,
                engineTemperature: sensor.engineTemperature,
                tirePressure: sensor.tirePressure,
              },
              environment: {
                roadCondition: pick(['dry', 'wet', 'icy']),
                visibility: randInt(100, 5000),
                trafficDensity: pick(['low', 'medium', 'high']),
              },
              adas,
            }, token);
          }
        }

        const time = new Date().toLocaleTimeString();
        console.log(`  [${time}] 📡 ${vid} → speed:${sensor.speed}km/h  engine:${sensor.engineTemperature}°C  lat:${sensor.latitude.toFixed(3)}  lng:${sensor.longitude.toFixed(3)}`);
      } catch (err) {
        console.error(`  ❌ Error updating ${vid}:`, err.message);
      }
    }
  }, 3000); // every 3 seconds

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Simulator stopped.');
    clearInterval(interval);
    process.exit(0);
  });

  console.log('   Press Ctrl+C to stop.\n');
})();
