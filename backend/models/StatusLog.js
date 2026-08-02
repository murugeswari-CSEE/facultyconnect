const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  action: { type: String, required: true },
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('StatusLog', statusLogSchema);