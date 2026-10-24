
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
    (slot) => currentTime >= slot.startTime && currentTime < slot.endTime
  );

  if (!activeSlot) {
    return null;
  }

  return {
    status: 'In Class',
    subject: activeSlot.subject,
    classroom: activeSlot.classroom,
    batch: activeSlot.batch,
    freeAt: activeSlot.endTime
  };
}

async function getEffectiveStatus(professor) {
  if (!professor.isAutomatic) {
    return {
      status: professor.manualStatus || 'Out of Office',
      location: professor.location || '',
      note: professor.statusNote || '',
      subject: null,
      classroom: null,
      batch: null,
      freeAt: null,
      nextClass: null,
      isAutomatic: false
    };
  }

  const liveClass = await getLiveClassStatus(professor._id);

  if (liveClass) {
    return {
      ...liveClass,
      location: professor.location || '',
      note: professor.statusNote || '',
      isAutomatic: true,
      nextClass: null
    };
  }

  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

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
  const currentTime =
    `${String(istTime.getUTCHours()).padStart(2, '0')}:` +
    `${String(istTime.getUTCMinutes()).padStart(2, '0')}`;

  const slots = await Timetable.find({
    professor: professor._id,
    day: today
  }).sort({ startTime: 1 });

  const nextSlot = slots.find(slot => slot.startTime > currentTime);

  return {
    status: 'Out of Office',
    location: professor.location || '',
    note: professor.statusNote || '',
    subject: null,
    classroom: null,
    batch: null,
    freeAt: null,
    nextClass: nextSlot
      ? {
          startTime: nextSlot.startTime,
          subject: nextSlot.subject,
          classroom: nextSlot.classroom
        }
      : null,
    isAutomatic: true
  };
}

module.exports = {
  getLiveClassStatus,
  getEffectiveStatus
};
