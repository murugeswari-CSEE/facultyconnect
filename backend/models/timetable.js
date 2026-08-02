const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  startTime: { type: String, required: true }, // format "HH:MM" e.g. "09:30"
  endTime: { type: String, required: true },   // format "HH:MM" e.g. "10:30"
  subject: { type: String, required: true },
  classroom: { type: String, required: true },
  batch: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);