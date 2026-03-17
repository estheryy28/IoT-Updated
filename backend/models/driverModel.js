const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:            { type: String, required: true },
    licenseNumber:   { type: String, required: true, unique: true },
    assignedVehicle: { type: String, default: null },
    fatigueLevel:    { type: Number, default: 0, min: 0, max: 100 },
    alertnessScore:  { type: Number, default: 100, min: 0, max: 100 },
    status:          { type: String, enum: ['active', 'inactive', 'on_trip'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
