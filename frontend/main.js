// frontend/main.js

const socket = io();

// Elements
const mainPage = document.getElementById('mainPage');
const usernameDisplay = document.getElementById('usernameDisplay');
const roomLink = document.getElementById('roomLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const youtubeLink = document.getElementById('youtubeLink');
const loadVideoBtn = document.getElementById('loadVideoBtn');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const datetimeDisplay = document.getElementById('datetime');

// YouTube Player Instance
let player;
let isPlayerReady = false;
let isSeeking = false; // Flag to prevent sync loops

// Get username from localStorage
const username = localStorage.getItem('username');
if (!username) {
  window.location.href = 'index.html';
}

// Display username
usernameDisplay.textContent = username;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// If roomId is not present, redirect to index
if (!roomId) {
  alert('No room ID provided. Redirecting to home page.');
  window.location.href = 'index.html';
}

// Set room link
const currentUrl = window.location.href;
roomLink.value = currentUrl;

// Copy Room Link
copyLinkBtn.addEventListener('click', () => {
  roomLink.select();
  document.execCommand('copy');
  alert('Invite link copied!');
});

// Join the room via Socket.io
socket.emit('joinRoom', { roomId, username });

// Listen for room existence
socket.on('roomExists', (exists) => {
  if (!exists) {
    alert('Room does not exist. Redirecting to home page.');
    window.location.href = 'index.html';
  }
});

// Update users list (optional: can display in UI)
socket.on('updateUsers', (users) => {
  console.log('Users in room:', users);
});

// Handle YouTube Video Loading
loadVideoBtn.addEventListener('click', () => {
  const videoUrl = youtubeLink.value.trim();
  if (isValidYoutubeLink(videoUrl)) {
    const videoId = extractVideoID(videoUrl);
    if (videoId) {
      loadYouTubeVideo(videoId);
      // Notify other users
      socket.emit('videoControl', { roomId, action: 'load', data: { videoId } });
    }
  } else {
    alert('Please enter a valid YouTube URL.');
  }
});

// Send current time every 3 seconds to keep videos in sync
setInterval(() => {
  if (isPlayerReady && player && !isSeeking) {
    const currentTime = player.getCurrentTime();
    socket.emit('videoControl', { 
      roomId, 
      action: 'sync', 
      data: { 
        currentTime,
        videoId: player.getVideoData().video_id
      } 
    });
  }
}, 1000);

// Receive video control actions
socket.on('videoControl', ({ action, data }) => {
  if (!isPlayerReady) return;
  
  if (action === 'load' && data.videoId) {
    loadYouTubeVideo(data.videoId, false);
  } else if (action === 'play') {
    player.playVideo();
  } else if (action === 'pause') {
    player.pauseVideo();
  } else if (action === 'seek') {
    isSeeking = true;
    player.seekTo(data.currentTime);
    setTimeout(() => { isSeeking = false; }, 1000);
  } else if (action === 'sync') {
    // Only sync if the time difference is significant (more than 2 seconds)
    const currentTime = player.getCurrentTime();
    if (Math.abs(currentTime - data.currentTime) > 2) {
      isSeeking = true;
      player.seekTo(data.currentTime);
      setTimeout(() => { isSeeking = false; }, 1000);
    }
  }
});

// YouTube IFrame API Integration
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '', // Start with no video
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    },
    playerVars: {
      'enablejsapi': 1,
      'rel': 0, // Don't show related videos
      'modestbranding': 1 // Hide YouTube logo
    }
  });
}

function onPlayerReady(event) {
  isPlayerReady = true;
  // Request current video state from server
  socket.emit('requestVideoState', { roomId });
}

function onPlayerStateChange(event) {
  if (isSeeking) return; // Don't emit events if we're seeking due to sync
  
  if (event.data === YT.PlayerState.PLAYING) {
    socket.emit('videoControl', { roomId, action: 'play', data: {} });
  } else if (event.data === YT.PlayerState.PAUSED) {
    socket.emit('videoControl', { roomId, action: 'pause', data: {} });
  } else if (event.data === YT.PlayerState.CUED) {
    // If a new video is cued, sync the state
    const currentTime = player.getCurrentTime();
    socket.emit('videoControl', { 
      roomId, 
      action: 'sync', 
      data: { currentTime } 
    });
  }
}

// Track seeking in the video
player && player.addEventListener('onStateChange', (event) => {
  if (!isSeeking && isPlayerReady && event.data === YT.PlayerState.PLAYING) {
    const currentTime = player.getCurrentTime();
    socket.emit('videoControl', { 
      roomId, 
      action: 'seek', 
      data: { currentTime } 
    });
  }
});

function onPlayerError(event) {
  console.error('YouTube Player Error:', event.data);
  alert('Failed to load the YouTube video. Please try a different link.');
}

function loadYouTubeVideo(videoId, emit = true) {
  if (isPlayerReady) {
    player.loadVideoById(videoId);
  } else {
    // If player is not ready yet, wait for it to be ready
    const interval = setInterval(() => {
      if (isPlayerReady) {
        player.loadVideoById(videoId);
        clearInterval(interval);
      }
    }, 100);
  }
}

// Request current video state when player is ready
socket.on('videoStateResponse', (state) => {
  if (state.videoId && isPlayerReady) {
    player.loadVideoById({
      videoId: state.videoId,
      startSeconds: state.currentTime
    });
    if (state.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }
});

// The rest of functions remain unchanged
function isValidYoutubeLink(url) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return pattern.test(url);
}

function extractVideoID(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Date and Time Update
function updateDateTime() {
  const now = new Date();
  const formatted = `${String(now.getDate()).padStart(2, '0')} `
                 + `${String(now.getMonth() + 1).padStart(2, '0')} `
                 + `${String(now.getFullYear()).substr(-2)} `
                 + `${String(now.getHours()).padStart(2, '0')}:`
                 + `${String(now.getMinutes()).padStart(2, '0')}:`
                 + `${String(now.getSeconds()).padStart(2, '0')}`;
  datetimeDisplay.textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Handle Mouse Movement (Basic Implementation)
document.addEventListener('mousemove', (e) => {
  const mouseData = { x: e.clientX, y: e.clientY };
  socket.emit('mouseMove', { roomId, mouseData });
});

// Receive Mouse Movement from others
socket.on('mouseMove', (mouseData) => {
  // Create a custom cursor or indicator
  const cursor = document.createElement('div');
  cursor.classList.add('remote-cursor');
  cursor.style.left = `${mouseData.x}px`;
  cursor.style.top = `${mouseData.y}px`;
  document.body.appendChild(cursor);

  // Remove the cursor after a short delay
  setTimeout(() => {
    cursor.remove();
  }, 100);
});

// Load YouTube IFrame API Script Once
(function loadYouTubeIFrameAPI() {
  if (document.getElementById('youtube-iframe-api')) return; // Prevent multiple loads
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  tag.id = 'youtube-iframe-api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();
