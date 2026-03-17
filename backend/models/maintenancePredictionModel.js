const mongoose = require('mongoose');

const maintenancePredictionSchema = new mongoose.Schema(
  {
    vehicleId:        { type: String, required: true, index: true },
    component:        { type: String, required: true },
    predictedFailure: { type: Date },
    confidence:       { type: Number, min: 0, max: 100 },
    severity:         { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    recommendation:   { type: String },
    status:           { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending' },
    timestamp:        { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenancePrediction', maintenancePredictionSchema);
