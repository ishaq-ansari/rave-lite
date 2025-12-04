// backend/server.js
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve frontend static files from ../frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// In-memory rooms data
const rooms = {};
// Map socket.id to username and roomId
const clients = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinRoom', ({ roomId, username }) => {
    if (!roomId || !username) return;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        videoState: { videoId: null, currentTime: 0, isPlaying: false }
      };
    }

    // Add user
    rooms[roomId].users.push({ id: socket.id, username });
    clients[socket.id] = { roomId, username };

    socket.join(roomId);

    // Notify client the room exists
    socket.emit('roomExists', true);

    // Update users list for room
    io.to(roomId).emit('updateUsers', rooms[roomId].users.map(u => u.username));

    // Send current video state to the newly connected socket
    socket.emit('videoStateResponse', rooms[roomId].videoState);

    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on('videoControl', ({ roomId, action, data }) => {
    if (!rooms[roomId]) return;
    const room = rooms[roomId];

    if (action === 'load') {
      room.videoState.videoId = data.videoId;
      room.videoState.currentTime = 0;
      room.videoState.isPlaying = false;
    } else if (action === 'play') {
      room.videoState.isPlaying = true;
    } else if (action === 'pause') {
      room.videoState.isPlaying = false;
    } else if (action === 'seek' || action === 'sync') {
      room.videoState.currentTime = data.currentTime || 0;
    }

    // Broadcast to others in the room
    socket.to(roomId).emit('videoControl', { action, data });
  });

  socket.on('requestVideoState', ({ roomId }) => {
    if (!rooms[roomId]) return;
    socket.emit('videoStateResponse', rooms[roomId].videoState);
  });

  socket.on('mouseMove', ({ roomId, mouseData }) => {
    if (!rooms[roomId]) return;
    socket.to(roomId).emit('mouseMove', mouseData);
  });

  socket.on('disconnect', () => {
    const client = clients[socket.id];
    if (client) {
      const { roomId, username } = client;
      const room = rooms[roomId];
      if (room) {
        room.users = room.users.filter(u => u.id !== socket.id);
        // If no users left, delete the room
        if (room.users.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          io.to(roomId).emit('updateUsers', room.users.map(u => u.username));
        }
      }
      delete clients[socket.id];
      console.log(`Socket ${socket.id} disconnected`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful error handling for common server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try running on a different PORT or stop the process that is using it.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
