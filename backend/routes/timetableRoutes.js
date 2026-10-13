const express = require('express');
const Timetable = require('../models/timetable');

const router = express.Router();

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateSlot(body) {
  const { startTime, endTime } = body;
  if (!TIME_REGEX.test(startTime || '') || !TIME_REGEX.test(endTime || '')) {
    return 'Times must be 24-hour HH:MM, e.g. 09:30 or 13:05';
  }
  if (startTime >= endTime) {
    return 'End time must be after start time';
  }
  return null;
}

function notify(req, professorId) {
  const io = req.app.get('io');
  if (io) io.emit('statusUpdate', { professorId });
}

// Add a slot
router.post('/', async (req, res) => {
  try {
    const problem = validateSlot(req.body);
    if (problem) return res.status(400).json({ error: problem });

    const slot = new Timetable(req.body);
    await slot.save();
    notify(req, slot.professor);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit a slot
router.put('/slot/:slotId', async (req, res) => {
  try {
    const problem = validateSlot(req.body);
    if (problem) return res.status(400).json({ error: problem });

    const { day, startTime, endTime, subject, classroom, batch } = req.body;
    const slot = await Timetable.findByIdAndUpdate(
      req.params.slotId,
      { day, startTime, endTime, subject, classroom, batch },
      { new: true, runValidators: true }
    );
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    notify(req, slot.professor);
    res.json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a slot
router.delete('/slot/:slotId', async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    notify(req, slot.professor);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all slots for one professor
router.get('/:professorId', async (req, res) => {
  try {
    const slots = await Timetable.find({ professor: req.params.professorId });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;