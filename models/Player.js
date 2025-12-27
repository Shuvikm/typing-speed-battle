const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: 'luffy',
  },
  socketId: {
    type: String,
    required: true,
  },
  totalGames: {
    type: Number,
    default: 0,
  },
  totalWins: {
    type: Number,
    default: 0,
  },
  totalLosses: {
    type: Number,
    default: 0,
  },
  bestWPM: {
    type: Number,
    default: 0,
  },
  averageWPM: {
    type: Number,
    default: 0,
  },
  averageAccuracy: {
    type: Number,
    default: 0,
  },
  totalTypedChars: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
playerSchema.index({ name: 1 });
playerSchema.index({ bestWPM: -1 });
playerSchema.index({ totalWins: -1 });

module.exports = mongoose.model('Player', playerSchema);

