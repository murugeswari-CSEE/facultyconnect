const express = require('express');
const StatusLog = require('../models/StatusLog');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const logs = await StatusLog.find().populate('professor', 'name department').sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;