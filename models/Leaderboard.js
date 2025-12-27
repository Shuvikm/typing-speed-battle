const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: 'luffy',
  },
  bestWPM: {
    type: Number,
    default: 0,
  },
  averageWPM: {
    type: Number,
    default: 0,
  },
  totalGames: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  winRate: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    default: 'Cabin Boy',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Index for leaderboard queries
leaderboardSchema.index({ bestWPM: -1 });
leaderboardSchema.index({ averageWPM: -1 });
leaderboardSchema.index({ wins: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

