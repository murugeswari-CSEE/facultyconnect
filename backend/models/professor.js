const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  manualStatus: {
    type: String,
    enum: ['In Cabin', 'In Meeting', 'Out of Office', 'On Leave'],
    default: 'Out of Office',
  },
  location: { type: String, default: '' },
  statusNote: { type: String, default: '' },
  manualSetAt: { type: Date, default: null },
  isAutomatic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Professor', professorSchema);