const express = require('express');
const Professor = require('../models/Professor');
const { getLiveClassStatus } = require('../utils/statusHelper');

const router = express.Router();

router.get('/:professorId', async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.professorId);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Only check the timetable if the professor is in automatic mode
    if (professor.isAutomatic) {
      const classStatus = await getLiveClassStatus(req.params.professorId);

      if (classStatus) {
        return res.json({
          professor: professor.name,
          department: professor.department,
          ...classStatus,
        });
      }
    }

    // Either not automatic (manual override active), or no class right now
    return res.json({
      professor: professor.name,
      department: professor.department,
      status: professor.manualStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;