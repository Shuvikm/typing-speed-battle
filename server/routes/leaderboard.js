const express = require('express');
const Leaderboard = require('../models/Leaderboard');

const router = express.Router();

// GET /api/leaderboard — top 50 players by best WPM
router.get('/', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find()
            .sort({ bestWPM: -1 })
            .limit(50)
            .select('playerName avatar bestWPM averageWPM totalGames wins losses winRate rank');
        res.json(leaderboard);
    } catch (error) {
        console.error('❌ GET /api/leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
