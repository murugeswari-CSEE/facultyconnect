const express = require('express');
const professor = require('../models/professor');
const { getEffectiveStatus } = require('../utils/statusHelper');

const router = express.Router();

router.get('/:professorId', async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.professorId);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    res.json(await getEffectiveStatus(professor));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;