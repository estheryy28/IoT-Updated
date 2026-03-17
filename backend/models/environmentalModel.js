const mongoose = require('mongoose');

const environmentalDataSchema = new mongoose.Schema(
  {
    vehicleId:      { type: String, required: true, index: true },
    latitude:       { type: Number, required: true },
    longitude:      { type: Number, required: true },
    temperature:    { type: Number, required: true },         // °C
    humidity:        { type: Number, required: true },         // %
    rainLevel:      {
      type: String,
      enum: ['none', 'light', 'moderate', 'heavy'],
      default: 'none',
    },
    visibility:     { type: Number, required: true },          // meters
    roadCondition:  {
      type: String,
      enum: ['dry', 'wet', 'icy', 'flooded', 'snowy'],
      default: 'dry',
    },
    trafficDensity: {
      type: String,
      enum: ['low', 'medium', 'high', 'congested'],
      default: 'low',
    },
    timestamp:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EnvironmentalData', environmentalDataSchema);
