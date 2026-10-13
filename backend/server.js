require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const professorRoutes = require('./routes/professorRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const statusRoutes = require('./routes/statusRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const logRoutes = require('./routes/logRoutes');
const dns = require('dns');
const http = require('http');
const { Server } = require('socket.io');

// Commented out DNS override for cloud deployment compatibility
// dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Updated Express CORS configuration for Render deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api/professors', professorRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/logs', logRoutes);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('FacultyConnect Backend is Running!');
});

const server = http.createServer(app);

// Updated Socket.IO CORS configuration for Render deployment
const io = new Server(server, {
  cors: { 
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
// ---- Live timetable watcher ----
// Every 30 seconds, recompute each professor's status. If it changed (a class started or
// ended), push it to all dashboards so they update without anyone touching a button.
const Professor = require('./models/professor');
const StatusLog = require('./models/StatusLog');
const { getEffectiveStatus } = require('./utils/statusHelper');

const lastSeen = new Map();

setInterval(async () => {
  try {
    const professors = await Professor.find();
    for (const prof of professors) {
      const eff = await getEffectiveStatus(prof);
      const key = [eff.status, eff.subject || '', eff.location || '', eff.note || ''].join('|');
      const inClass = eff.status === 'In Class';
      const id = String(prof._id);
      const prev = lastSeen.get(id);
      lastSeen.set(id, { key, inClass });

      if (!prev || prev.key === key) continue;

      io.emit('statusUpdate', { professorId: prof._id, status: eff.status });

      if (inClass && !prev.inClass) {
        await StatusLog.create({
          professor: prof._id,
          action: 'Automatic: class started',
          details: `${eff.subject} in Room ${eff.classroom}`,
        });
      } else if (!inClass && prev.inClass && prof.isAutomatic) {
        await StatusLog.create({
          professor: prof._id,
          action: 'Automatic: class ended',
          details: `Status is now ${eff.status}`,
        });
      }
    }
  } catch (err) {
    console.error('Status watcher error:', err.message);
  }
}, 30 * 1000);
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});