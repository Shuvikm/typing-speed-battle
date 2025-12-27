const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
  },
  playerName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'luffy',
  },
  wpm: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  timeElapsed: {
    type: Number,
    default: 0,
  },
  finished: {
    type: Boolean,
    default: false,
  },
});

const gameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  mode: {
    type: String,
    enum: ['solo', 'battle'],
    default: 'battle',
  },
  gameText: {
    type: String,
    required: true,
  },
  results: [gameResultSchema],
  winner: {
    type: String, // playerId of winner
    default: null,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },
});

// Indexes
gameSchema.index({ roomId: 1 });
gameSchema.index({ startedAt: -1 });
gameSchema.index({ status: 1 });

module.exports = mongoose.model('Game', gameSchema);

