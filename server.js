require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./server/config/database');
const leaderboardRouter = require('./server/routes/leaderboard');
const playerRouter = require('./server/routes/player');
const registerGameSocket = require('./server/socket/gameSocket');
const registerQuizSocket = require('./server/socket/quizSocket');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express app setup ─────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── REST API routes ────────────────────────────────────────────────────────────
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/player', playerRouter);

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  registerGameSocket(socket, io);
  registerQuizSocket(socket, io);
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🏴‍☠️  Typing Speed Battle Server running on port ${PORT}`);
  console.log('Ready for battles! ⚔️');
});
