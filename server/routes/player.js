const express = require('express');
const Player = require('../models/Player');

const router = express.Router();

// GET /api/player/:name — get a single player by name
router.get('/:name', async (req, res) => {
    try {
        const player = await Player.findOne({ name: req.params.name });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        console.error('❌ GET /api/player/:name error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
