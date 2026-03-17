const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId:         { type: String, required: true, unique: true },
    make:              { type: String, required: true },
    model:             { type: String, required: true },
    year:              { type: Number },
    registrationNumber:{ type: String, required: true, unique: true },
    assignedDriver:    { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    status:            { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
