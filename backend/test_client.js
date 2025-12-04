// backend/test_client.js
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

const roomId = process.argv[2] || 'test-room-123';
const username = process.argv[3] || ('tester-' + Math.random().toString(36).substr(2,4));

socket.on('connect', () => {
  console.log('Connected as', socket.id);
  socket.emit('joinRoom', { roomId, username });
});

socket.on('roomExists', (exists) => {
  console.log('roomExists', exists);
});

socket.on('updateUsers', (users) => {
  console.log('updateUsers', users);
});

socket.on('videoControl', (payload) => {
  console.log('videoControl received:', payload);
});

socket.on('videoStateResponse', (state) => {
  console.log('videoStateResponse', state);
});

// After connected, simulate load video, play, and request state
setTimeout(() => {
  console.log('Sending load action');
  socket.emit('videoControl', { roomId, action: 'load', data: { videoId: 'dQw4w9WgXcQ' } });
}, 500);

setTimeout(() => {
  console.log('Sending play action');
  socket.emit('videoControl', { roomId, action: 'play', data: {} });
}, 1000);

setTimeout(() => {
  console.log('Requesting video state');
  socket.emit('requestVideoState', { roomId });
}, 1500);

// Disconnect after a while
setTimeout(() => {
  console.log('Disconnecting');
  socket.disconnect();
}, 4000);
