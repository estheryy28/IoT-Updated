const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    vehicleId:        { type: String, required: true, index: true },
    speed:            { type: Number, default: 0 },
    engineTemperature:{ type: Number, default: 0 },
    tirePressure:     { type: Number, default: 0 },
    fuelLevel:        { type: Number, default: 0 },
    brakeStatus:      { type: String, default: 'normal' },
    latitude:         { type: Number },
    longitude:        { type: Number },
    timestamp:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SensorData', sensorDataSchema);
