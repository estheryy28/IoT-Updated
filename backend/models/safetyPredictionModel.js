const mongoose = require('mongoose');

const safetyPredictionSchema = new mongoose.Schema(
  {
    vehicleId:           { type: String, required: true, index: true },
    driverId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    riskScore:           { type: Number, required: true, min: 0, max: 100 },
    riskLevel:           {
      type: String,
      enum: ['Safe', 'Warning', 'High Risk', 'Critical'],
      required: true,
    },
    contributingFactors: [{ type: String }],
    recommendedAction:   { type: String },
    timestamp:           { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SafetyPrediction', safetyPredictionSchema);
