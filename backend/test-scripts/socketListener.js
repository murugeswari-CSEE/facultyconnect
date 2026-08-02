const { io } = require('socket.io-client');

const socket = io('https://facultyconnect-241s.onrender.com');

socket.on('connect', () => {
  console.log('Connected to server as:', socket.id);
});

socket.on('statusUpdate', (data) => {
  console.log('Received statusUpdate event:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});