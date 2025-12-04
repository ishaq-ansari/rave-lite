<!-- README for Rave-lite -->

# Rave-lite

Rave-lite is a lightweight application that allows users to create or join synchronized rooms for watching YouTube videos together. Users can host a room, generate an invite link, and invite others to join the room to watch and control YouTube videos in real-time.

## Features

- **Host a Room:** Create a new room and generate an invite link.
- **Join a Room:** Join an existing room using an invite link or Room ID.
- **Synchronized YouTube Playback:** Play, pause, and load videos that are synchronized across all users in the room.
- **Real-time Mouse Movement:** See mouse movements of other users in the room.
- **User List:** View the list of users currently in the room.
- **Real-time Communication:** Powered by Socket.io for real-time synchronization.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js, Socket.io
- **Deployment:** To be deployed on a hosting platform that supports Node.js (e.g., Heroku, Vercel, DigitalOcean)


---

## Table of Contents

1. Quick Start (Local)
2. Repo Structure
3. Backend (Implementation & Events)
4. Frontend (How it works)
5. Test Client
6. Development
7. Deployment Recommendations
8. Troubleshooting
9. Contributing
10. License

---

## 1) Quick Start (Local) ⚡

Prerequisites

- Node.js >= 16.x and npm (Download from https://nodejs.org/)

Start the server (this serves the frontend and socket.io):

```bash
cd backend
npm install
npm start
```

- Open a browser and visit: http://localhost:3000/
- Host a room: Enter a username and click 'Host a Room' — it will redirect to `main.html?room=<roomId>`.
- Join a room: Enter your username and use the invite link or Room ID to join.

Notes

- The server listens on `PORT` (default 3000). To run on a different port set `PORT` env var:

```bash
PORT=4000 npm start
```

---

## 2) Repo Structure 🗂️

```
rave-lite/
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  └─ test_client.js
├─ frontend/
│  ├─ index.html        # Landing, enter username / host or join
│  ├─ main.html         # Room page with player
│  ├─ main.js           # Controls + socket integration + YouTube iframe
│  ├─ input.js          # Welcome page logic
│  ├─ styles.css        # Simple styles
│  └─ utils.js          # Utilities (optional)
├─ README.md
└─ .vscode/
```

The backend serves the frontend static files from `frontend/` and handles WebSocket events with `socket.io`.

---

## 3) Backend (Implementation & Events) 🔧

Summary

- Built with Express.js and Socket.io; the server is implemented in `backend/server.js`.
- Serves static files from `frontend/` and exposes a `socket.io` endpoint.
- Stores rooms and state in memory (simple and works locally). For production / multi-instance deployments, use an external store (e.g., Redis) for socket adapter and persistent rooms.

Key behaviors

- Rooms are created implicitly when the first user joins.
- `rooms` store a list of users and `videoState`.
- If a room becomes empty, it is removed from memory.

Environment vars

- `PORT` — port to listen on (default: 3000)

Socket events (server ↔ client)

- `joinRoom` (client -> server)

  - Payload: { roomId, username }
  - Server action: create/join room, add user, emit `roomExists`, `updateUsers`, and `videoStateResponse` to the joining socket.

- `roomExists` (server -> client)

  - Payload: boolean
  - Purpose: Confirm that the room exists / was created. The server returns `true` for newly created rooms.

- `updateUsers` (server -> clients in room)

  - Payload: array of usernames
  - Purpose: Keep the user list display updated.

- `videoControl` (bi-directional)

  - Payload: { roomId, action, data }
  - Actions: `load`, `play`, `pause`, `seek`, `sync`.
  - Server action: update in-memory `videoState` for the room; broadcast event to others in the room.

- `requestVideoState` (client -> server)

  - Payload: { roomId }
  - Server action: emit `videoStateResponse` with the current `videoState`.

- `videoStateResponse` (server -> client)

  - Payload: { videoId, currentTime, isPlaying }
  - Purpose: Provide full current state for a newly-joined client.

- `mouseMove` (client -> server -> other clients)
  - Payload: { roomId, mouseData: { x, y } }
  - Server action: broadcast `mouseMove` to others in the room.

Limitations & considerations

- In-memory storage: If the server restarts, all rooms & states are lost.
- Not suitable for scale across multiple server instances (use Redis adapter & centralized state for that).
- No authentication — the username is client-supplied; a user can impersonate others.

---

## 4) Frontend (How it works) 🎛️

Files

- `index.html` – Entry page where you input your username and choose to host or join.
- `main.html` – Room page containing player and UI.
- `input.js` – Handles the host/join UI and redirects to `main.html` with `room` query param.
- `main.js` – Main logic that communicates with the server via socket.io, manages the YouTube IFrame player, and emits/receives events.

YouTube IFrame API

- The frontend uses the YouTube IFrame API to create the `YT.Player` instance.
- Uses `enablejsapi` and player events to control playback and emit `videoControl` events.

Socket integration

- `main.js` creates a `const socket = io()` which connects to the server's `socket.io` endpoint served by the backend.
- The frontend sends events like `joinRoom`, `videoControl` with actions `load`, `play`, `pause`, `seek`, `sync`, and listens for broadcast events from the server.

Time sync strategy

- The client sends periodic `sync` events to the server with the current video time so other clients can correct any drift.
- The server stores the currentTime and broadcast messages to keep everyone synchronized.

---

## 5) Test Client (Automated socket testing) 🧪

A simple Node script is available at `backend/test_client.js` that allows automated testing of sockets.

Run it with optional args:

```bash
cd backend
node test_client.js [roomId] [username]
```

If no args are provided, it defaults to `test-room-123` and a random username. You can run multiple instances to test room behavior and event broadcast.

---

## 6) Development 🛠️

Scripts

- `npm start` — Run server (Node)
- `npm run dev` — (requires nodemon) Run server in dev mode for auto-restarts

General dev flow

1. Run server: `cd backend && npm install && npm run dev`.
2. Open http://localhost:3000/ and use multiple browser tabs to test sync and mouse movement.
3. Use the test client in `backend/test_client.js` to emulate clients.

Logging

- The server prints debug messages for socket activity and room lifecycle; inspect server console logs or `backend/server.log` if you run the server with `nohup`.

---

## 7) Deployment Recommendations 🚀

Small/Single instance

- Deploy to Heroku / Vercel / DigitalOcean App Platform. For Heroku, set the Node buildpack; ensure `start` script is present.

Multiple instances / scaling

- Use Redis adapter (`socket.io-redis`) so socket.io can route messages between processes.
- Persist room state (Redis, MongoDB) to avoid losing rooms during restarts.
- Use `process.env.PORT` (server respects `PORT` in `server.js`).

Static assets & CDN

- The backend serves static HTML and JS — for performance, consider hosting them on a CDN and only using the Express app as the socket endpoint.

Security

- Protect the server with appropriate CORS policies and validation for events.
- Consider adding authentication or room tokens for private rooms.

---

## 8) Troubleshooting 🪲

- Backend doesn't start?

  - Check Node version and that `npm install` ran successfully.
  - Verify `server.log` or the terminal where the server runs.
  - Use `PORT=3000 npm start` or `npx nodemon server.js` in dev.

- Socket.io client errors:

  - Ensure you load the socket.io client script from `http://localhost:3000/socket.io/socket.io.js` (backed by the server).
  - Browser and backend must be reachable (CORS / proxies may break default connection).

- Video playback isn't syncing:
  - Increase the frequency of `sync` events, or improve event debouncing logic.
  - Make sure client `player` is correctly reporting time via `player.getCurrentTime()`.

---

## 9) Contributing 🤝

If you’d like to improve this project, please:

1. Fork the repository
2. Create a feature branch (e.g., `feat/redis-adapter`)
3. Add tests and validation
4. Open a PR explaining your change

Recommended improvements

- Add authentication and room ownership
- Add persistent storage for rooms (Redis/Mongo)
- Add unit and integration tests
- Add E2E tests for synchronization flows

---

## 10) License

This project is MIT licensed — see the `LICENSE` file for details.

---

TODO: create a Dockerfile and a deployment workflow next (e.g., GitHub Actions or Heroku config). Tell me which step you’d like me to take next. 💡

