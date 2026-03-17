const mongoose = require('mongoose');

const adasDataSchema = new mongoose.Schema(
  {
    vehicleId:            { type: String, required: true, index: true },
    aebTriggered:         { type: Boolean, default: false },   // Autonomous Emergency Braking
    laneDeparture:        { type: Boolean, default: false },
    adaptiveCruiseActive: { type: Boolean, default: false },
    blindSpotDetected:    { type: Boolean, default: false },
    driverDrowsiness:     { type: Boolean, default: false },
    timestamp:            { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ADASData', adasDataSchema);
