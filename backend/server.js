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

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});