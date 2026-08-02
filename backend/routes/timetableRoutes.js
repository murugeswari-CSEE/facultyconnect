const express = require('express');
const Timetable = require('../models/timetable');

const router = express.Router();

// Add a timetable slot
router.post('/', async (req, res) => {
  try {
    const slot = new Timetable(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all timetable slots for one professor
router.get('/:professorId', async (req, res) => {
  try {
    const slots = await Timetable.find({ professor: req.params.professorId });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;