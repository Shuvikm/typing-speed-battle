require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const Game = require('./models/Game');
const Player = require('./models/Player');
const Leaderboard = require('./models/Leaderboard');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ bestWPM: -1 })
      .limit(50)
      .select('playerName avatar bestWPM averageWPM totalGames wins losses winRate rank');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/player/:name', async (req, res) => {
  try {
    const player = await Player.findOne({ name: req.params.name });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store rooms and players (in-memory for real-time performance)
const rooms = new Map();
const players = new Map();

// Game text pool
const gameTexts = [
  "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive. The Going Merry was the first ship of the Straw Hat Pirates, carrying them through countless adventures.",
  "The Thousand Sunny replaced the Going Merry and became the new home of Luffy and his crew. Each crew member has unique abilities that make them essential to the team. Together they face powerful enemies and overcome impossible challenges.",
  "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has hidden the true history for eight hundred years.",
  "Luffy's dream is to become the Pirate King and find the legendary treasure known as One Piece. Along the way, he gathers a crew of loyal friends who share his adventurous spirit and determination to achieve their dreams.",
  "Zoro aims to become the world's greatest swordsman, while Sanji dreams of finding the All Blue. Nami wants to map the entire world, and each Straw Hat member has their own unique goal that drives them forward.",
];

// Helper function to get rank title
const getRankTitleFromWPM = (wpm) => {
  if (wpm >= 100) return 'Pirate King';
  if (wpm >= 80) return 'Yonko';
  if (wpm >= 60) return 'Super Rookie';
  if (wpm >= 40) return 'Pirate Captain';
  if (wpm >= 20) return 'Marine Captain';
  return 'Cabin Boy';
};

// Helper function to save game results to MongoDB
const saveGameToDB = async (room) => {
  try {
    const gameResults = room.players.map((p) => ({
      playerId: p.id,
      playerName: p.name,
      avatar: p.avatar,
      wpm: p.wpm,
      accuracy: p.accuracy,
      finished: p.finished,
    }));

    // Find winner
    const sortedResults = [...gameResults].sort((a, b) => b.wpm - a.wpm);
    const winnerId = sortedResults[0]?.playerId || null;

    // Save game to database
    const game = new Game({
      roomId: room.id,
      mode: room.mode,
      gameText: room.gameText,
      results: gameResults,
      winner: winnerId,
      status: 'completed',
      endedAt: new Date(),
    });

    await game.save();

    // Update player stats
    for (const result of gameResults) {
      let player = await Player.findOne({ socketId: result.playerId });
      
      if (!player) {
        // Create new player
        player = new Player({
          name: result.playerName,
          avatar: result.avatar,
          socketId: result.playerId,
        });
      }

      // Update stats
      player.totalGames += 1;
      if (result.wpm > player.bestWPM) {
        player.bestWPM = result.wpm;
      }

      // Calculate average WPM
      const totalWPM = (player.averageWPM * (player.totalGames - 1)) + result.wpm;
      player.averageWPM = Math.round(totalWPM / player.totalGames);

      // Calculate average accuracy
      const totalAcc = (player.averageAccuracy * (player.totalGames - 1)) + result.accuracy;
      player.averageAccuracy = Math.round(totalAcc / player.totalGames);

      // Update wins/losses (only for battle mode)
      if (room.mode === 'battle') {
        if (result.playerId === winnerId && gameResults.length > 1) {
          player.totalWins += 1;
        } else if (gameResults.length > 1) {
          player.totalLosses += 1;
        }
      }

      player.lastPlayed = new Date();
      await player.save();

      // Update leaderboard
      await updateLeaderboard(result.playerName, result.avatar, player);
    }

    console.log(`✅ Game ${room.id} saved to database`);
  } catch (error) {
    console.error('❌ Error saving game to database:', error);
  }
};

// Helper function to update leaderboard
const updateLeaderboard = async (playerName, avatar, player) => {
  try {
    let leaderboard = await Leaderboard.findOne({ playerName });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        playerName,
        avatar,
      });
    }

    leaderboard.bestWPM = player.bestWPM;
    leaderboard.averageWPM = player.averageWPM;
    leaderboard.totalGames = player.totalGames;
    leaderboard.wins = player.totalWins;
    leaderboard.losses = player.totalLosses;
    leaderboard.winRate = player.totalGames > 0 
      ? Math.round((player.totalWins / player.totalGames) * 100) 
      : 0;
    leaderboard.rank = getRankTitleFromWPM(player.bestWPM);
    leaderboard.lastUpdated = new Date();

    await leaderboard.save();
  } catch (error) {
    console.error('❌ Error updating leaderboard:', error);
  }
};

// Generate random room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create room
  socket.on('create-room', (data) => {
    const { playerName, avatar, mode } = data;
    const roomId = generateRoomId();

    const room = {
      id: roomId,
      host: socket.id,
      players: [
        {
          id: socket.id,
          name: playerName,
          avatar: avatar || 'luffy',
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
        },
      ],
      mode: mode || 'battle',
      gameStarted: false,
      gameText: null,
      results: [],
    };

    rooms.set(roomId, room);
    players.set(socket.id, { roomId, playerName, avatar });

    socket.join(roomId);
    socket.emit('room-created', { roomId });
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, playerName, avatar } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('room-error', { message: 'Room not found!' });
      return;
    }

    if (room.gameStarted) {
      socket.emit('room-error', { message: 'Game already started!' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      avatar: avatar || 'luffy',
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
    };

    room.players.push(player);
    players.set(socket.id, { roomId, playerName, avatar });

    socket.join(roomId);
    socket.emit('room-joined', { roomId, players: room.players });
    io.to(roomId).emit('player-joined', { players: room.players });
    console.log(`${playerName} joined room ${roomId}`);
  });

  // Start game
  socket.on('start-game', (data) => { // Note: Server uses string literal for socket.io compatibility
    const { roomId } = data;
    const room = rooms.get(roomId);

    if (!room || room.host !== socket.id) {
      return;
    }

    if (room.mode === 'battle' && room.players.length < 2) {
      socket.emit('room-error', { message: 'Need at least 2 players for battle!' });
      return;
    }

    // Select random text
    const randomText = gameTexts[Math.floor(Math.random() * gameTexts.length)];
    room.gameText = randomText;
    room.gameStarted = true;

    // Reset all players
    room.players.forEach((player) => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.finished = false;
    });

    io.to(roomId).emit('game-start');
    setTimeout(() => {
      io.to(roomId).emit('game-text', { text: randomText });
    }, 3000);
    console.log(`Game started in room ${roomId}`);
  });

  // Request game text (for late joiners)
  socket.on('request-game-text', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (room && room.gameText) {
      socket.emit('game-text', { text: room.gameText });
    }
  });

  // Player progress update
  socket.on('player-progress', (data) => {
    const { roomId, progress, wpm } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.progress = progress;
      player.wpm = wpm;
    }

    io.to(roomId).emit('player-progress', {
      players: room.players,
    });
  });

  // Player finished
  socket.on('player-finished', async (data) => {
    const { roomId, wpm, accuracy } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.finished = true;
      player.wpm = wpm;
      player.accuracy = accuracy;
    }

    io.to(roomId).emit('player-finished', {
      playerId: socket.id,
      wpm,
      accuracy,
    });

    // Check if all players finished
    const allFinished = room.players.every((p) => p.finished);
    if (allFinished) {
      setTimeout(async () => {
        const results = room.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          wpm: p.wpm,
          accuracy: p.accuracy,
        }));
        room.results = results;
        io.to(roomId).emit('game-end', { results });
        
        // Save game to MongoDB
        await saveGameToDB(room);
      }, 2000);
    }
  });

  // Get game results
  socket.on('get-game-results', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (room && room.results.length > 0) {
      socket.emit('game-end', { results: room.results });
    }
  });

  // Quiz functionality
  const quizRooms = new Map();

  socket.on('join-quiz', (data) => {
    const { quizId, playerName, avatar } = data;
    let quiz = quizRooms.get(quizId);
    
    if (!quiz) {
      quiz = {
        id: quizId,
        participants: [],
        started: false,
        leaderboard: [],
      };
      quizRooms.set(quizId, quiz);
    }

    const participant = {
      id: socket.id,
      name: playerName,
      avatar: avatar || 'luffy',
      score: 0,
      wpm: 0,
      accuracy: 0,
    };

    quiz.participants.push(participant);
    socket.join(quizId);
    
    socket.emit('quiz-joined', { participants: quiz.participants });
    io.to(quizId).emit('quiz-joined', { participants: quiz.participants });
    console.log(`${playerName} joined quiz ${quizId}`);
  });

  socket.on('quiz-complete', (data) => {
    const { quizId, score, wpm, accuracy } = data;
    const quiz = quizRooms.get(quizId);
    
    if (quiz) {
      const participant = quiz.participants.find(p => p.id === socket.id);
      if (participant) {
        participant.score = score;
        participant.wpm = wpm;
        participant.accuracy = accuracy;
      }

      // Update leaderboard
      quiz.leaderboard = [...quiz.participants].sort((a, b) => b.score - a.score);
      io.to(quizId).emit('quiz-result', { leaderboard: quiz.leaderboard });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        room.players = room.players.filter((p) => p.id !== socket.id);
        players.delete(socket.id);

        if (room.players.length === 0) {
          rooms.delete(playerData.roomId);
          console.log(`Room ${playerData.roomId} deleted (empty)`);
        } else {
          io.to(playerData.roomId).emit('player-left', { players: room.players });
        }
      }
    }
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🏴‍☠️ Typing Speed Battle Server running on port ${PORT}`);
  console.log(`Ready for battles! ⚔️`);
});
