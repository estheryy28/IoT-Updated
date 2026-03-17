const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    vehicleId:  { type: String, required: true, index: true },
    alertType:  { type: String, required: true },
    severity:   {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    message:    { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    timestamp:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
