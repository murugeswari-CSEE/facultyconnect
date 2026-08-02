const Timetable = require('../models/timetable');

// Returns the professor's live class status, or null if not in class right now
async function getLiveClassStatus(professorId) {
  const now = new Date();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = daysOfWeek[now.getDay()];

  // Current time as "HH:MM" in 24-hour format
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  // Find any slot today where currentTime falls between startTime and endTime
  const slots = await Timetable.find({ professor: professorId, day: today });

  const activeSlot = slots.find(
    (slot) => currentTime >= slot.startTime && currentTime < slot.endTime
  );

  if (!activeSlot) {
    return null; // not in class right now
  }

  return {
    status: 'In Class',
    subject: activeSlot.subject,
    classroom: activeSlot.classroom,
    batch: activeSlot.batch,
    freeAt: activeSlot.endTime,
  };
}

module.exports = { getLiveClassStatus };