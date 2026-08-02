const express = require('express');
const bcrypt = require('bcrypt');
const Professor = require('../models/Professor');
const StatusLog = require('../models/StatusLog');

const router = express.Router();

// Create a professor (admin will use this)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const professor = new Professor({
      name,
      email,
      password: hashedPassword,
      department,
    });

    await professor.save();
    res.status(201).json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all professors (dashboard will use this)
router.get('/', async (req, res) => {
  try {
    const professors = await Professor.find();
    res.json(professors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually set status (professor tapped a button)
router.patch('/:id/status', async (req, res) => {
  try {
    const { manualStatus } = req.body;

    const validStatuses = ['In Cabin', 'In Meeting', 'Out of Office'];

    if (!validStatuses.includes(manualStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      {
        manualStatus,
        isAutomatic: false,
      },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Broadcast the change to all connected dashboard clients
    const io = req.app.get('io');
    io.emit('statusUpdate', {
      professorId: professor._id,
      status: professor.manualStatus,
    });
    await StatusLog.create({
  professor: professor._id,
  action: 'Manual status change',
  details: `Set to ${professor.manualStatus}`,
});

    res.json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resume automatic (timetable-driven) status
router.patch('/:id/resume-automatic', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      {
        isAutomatic: true,
      },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const io = req.app.get('io');
    io.emit('statusUpdate', {
      professorId: professor._id,
      status: 'resumed automatic',
    });

    res.json(professor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete a professor
router.delete('/:id', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json({ message: 'Professor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit professor
router.put('/:id', async (req, res) => {
  try {
    const { name, department } = req.body;

    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      { name, department },
      { new: true }
    );

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(professor);
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

    res.json({
      _id: professor._id,
      name: professor.name,
      department: professor.department
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;