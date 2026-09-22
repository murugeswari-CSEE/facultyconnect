const Timetable = require('../models/timetable');

async function getLiveClassStatus(professorId) {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMs);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const today = daysOfWeek[istTime.getUTCDay()];

  const currentHours = String(istTime.getUTCHours()).padStart(2, '0');
  const currentMinutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  const slots = await Timetable.find({
    professor: professorId,
    day: today
  });

  const activeSlot = slots.find(
    (slot) =>
      currentTime >= slot.startTime &&
      currentTime < slot.endTime
  );

  if (!activeSlot) {
    return null;
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