const Game = require('../models/Game');
const Player = require('../models/Player');
const Leaderboard = require('../models/Leaderboard');

// ─── Game text pool ─────────────────────────────────────────────────────────
const gameTexts = [
    "In the world of One Piece, Devil Fruits grant incredible powers to those who consume them. The Grand Line is a dangerous sea where only the strongest pirates survive. The Going Merry was the first ship of the Straw Hat Pirates, carrying them through countless adventures.",
    "The Thousand Sunny replaced the Going Merry and became the new home of Luffy and his crew. Each crew member has unique abilities that make them essential to the team. Together they face powerful enemies and overcome impossible challenges.",
    "The Will of D is a mysterious initial carried by certain individuals throughout history, suggesting a connection to the ancient kingdom and the Void Century. The World Government has hidden the true history for eight hundred years.",
    "Luffy's dream is to become the Pirate King and find the legendary treasure known as One Piece. Along the way, he gathers a crew of loyal friends who share his adventurous spirit and determination to achieve their dreams.",
    "Zoro aims to become the world's greatest swordsman, while Sanji dreams of finding the All Blue. Nami wants to map the entire world, and each Straw Hat member has their own unique goal that drives them forward.",
];

// ─── Random room ID generator ────────────────────────────────────────────────
const generateRoomId = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

// ─── Random game text picker ─────────────────────────────────────────────────
const getRandomGameText = () =>
    gameTexts[Math.floor(Math.random() * gameTexts.length)];

// ─── Rank title from WPM ─────────────────────────────────────────────────────
const getRankTitleFromWPM = (wpm) => {
    if (wpm >= 100) return 'Pirate King';
    if (wpm >= 80) return 'Yonko';
    if (wpm >= 60) return 'Super Rookie';
    if (wpm >= 40) return 'Pirate Captain';
    if (wpm >= 20) return 'Marine Captain';
    return 'Cabin Boy';
};

// ─── Update leaderboard entry ─────────────────────────────────────────────────
const updateLeaderboard = async (playerName, avatar, player) => {
    try {
        let leaderboard = await Leaderboard.findOne({ playerName });

        if (!leaderboard) {
            leaderboard = new Leaderboard({ playerName, avatar });
        }

        leaderboard.bestWPM = player.bestWPM;
        leaderboard.averageWPM = player.averageWPM;
        leaderboard.totalGames = player.totalGames;
        leaderboard.wins = player.totalWins;
        leaderboard.losses = player.totalLosses;
        leaderboard.winRate =
            player.totalGames > 0
                ? Math.round((player.totalWins / player.totalGames) * 100)
                : 0;
        leaderboard.rank = getRankTitleFromWPM(player.bestWPM);
        leaderboard.lastUpdated = new Date();

        await leaderboard.save();
    } catch (error) {
        console.error('❌ Error updating leaderboard:', error);
    }
};

// ─── Save completed game to MongoDB ──────────────────────────────────────────
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

        const sortedResults = [...gameResults].sort((a, b) => b.wpm - a.wpm);
        const winnerId = sortedResults[0]?.playerId || null;

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

        for (const result of gameResults) {
            let player = await Player.findOne({ socketId: result.playerId });

            if (!player) {
                player = new Player({
                    name: result.playerName,
                    avatar: result.avatar,
                    socketId: result.playerId,
                });
            }

            player.totalGames += 1;
            if (result.wpm > player.bestWPM) player.bestWPM = result.wpm;

            const totalWPM = player.averageWPM * (player.totalGames - 1) + result.wpm;
            player.averageWPM = Math.round(totalWPM / player.totalGames);

            const totalAcc =
                player.averageAccuracy * (player.totalGames - 1) + result.accuracy;
            player.averageAccuracy = Math.round(totalAcc / player.totalGames);

            if (room.mode === 'battle') {
                if (result.playerId === winnerId && gameResults.length > 1) {
                    player.totalWins += 1;
                } else if (gameResults.length > 1) {
                    player.totalLosses += 1;
                }
            }

            player.lastPlayed = new Date();
            await player.save();
            await updateLeaderboard(result.playerName, result.avatar, player);
        }

        console.log(`✅ Game ${room.id} saved to database`);
    } catch (error) {
        console.error('❌ Error saving game to database:', error);
    }
};

module.exports = { generateRoomId, getRandomGameText, getRankTitleFromWPM, saveGameToDB, updateLeaderboard };
