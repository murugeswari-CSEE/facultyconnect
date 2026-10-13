const express = require('express');
const bcrypt = require('bcrypt'); // if you switched to bcryptjs during deployment, keep your bcryptjs line instead
const Professor = require('../models/professor');
const Timetable = require('../models/timetable');
const StatusLog = require('../models/StatusLog');

const router = express.Router();

const VALID_STATUSES = ['In Cabin', 'In Meeting', 'Out of Office'];

// Create professor
router.post('/', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const professor = new Professor({ name, email, password: hashedPassword, department });
    await professor.save();
    const safe = professor.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Professor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const professor = await Professor.findOne({ email });
    if (!professor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, professor.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ _id: professor._id, name: professor.name, department: professor.department });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List professors (no password hashes)
router.get('/', async (req, res) => {
  try {
    const professors = await Professor.find().select('-password');
    res.json(professors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual status (+ optional location and note)
router.patch('/:id/status', async (req, res) => {
  try {
    const { manualStatus, location, note } = req.body;

    if (!VALID_STATUSES.includes(manualStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      {
        manualStatus,
        location: location || '',
        statusNote: note || '',
        isAutomatic: false,
        manualSetAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const io = req.app.get('io');
    io.emit('statusUpdate', { professorId: professor._id, status: professor.manualStatus });

    StatusLog.create({
      professor: professor._id,
      action: 'Manual status change',
      details: `Set to ${manualStatus}${location ? ' (' + location + ')' : ''}${note ? ' - "' + note + '"' : ''}`,
    }).catch(() => {});

    res.json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resume automatic status
router.patch('/:id/resume-automatic', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      { isAutomatic: true },
      { new: true }
    ).select('-password');

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const io = req.app.get('io');
    io.emit('statusUpdate', { professorId: professor._id, status: 'resumed automatic' });

    StatusLog.create({
      professor: professor._id,
      action: 'Resumed automatic status',
      details: 'Timetable-based status is active again',
    }).catch(() => {});

    res.json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit professor (name, department)
router.put('/:id', async (req, res) => {
  try {
    const { name, department } = req.body;
    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      { name, department },
      { new: true }
    ).select('-password');
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    res.json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete professor (and their timetable slots)
router.delete('/:id', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    await Timetable.deleteMany({ professor: req.params.id });
    res.json({ message: 'Professor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;