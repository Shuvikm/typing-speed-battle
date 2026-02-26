const { generateRoomId, getRandomGameText, saveGameToDB } = require('../helpers/gameHelpers');

// In-memory stores for real-time performance
const rooms = new Map();
const players = new Map();

/**
 * Register all game-related socket events on a connected socket.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerGameSocket = (socket, io) => {
    // ── Create room ────────────────────────────────────────────────────────────
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

    // ── Join room ──────────────────────────────────────────────────────────────
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

    // ── Start game ─────────────────────────────────────────────────────────────
    socket.on('start-game', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);

        if (!room || room.host !== socket.id) return;

        if (room.mode === 'battle' && room.players.length < 2) {
            socket.emit('room-error', { message: 'Need at least 2 players for battle!' });
            return;
        }

        const randomText = getRandomGameText();
        room.gameText = randomText;
        room.gameStarted = true;

        room.players.forEach((p) => {
            p.progress = 0;
            p.wpm = 0;
            p.accuracy = 100;
            p.finished = false;
        });

        io.to(roomId).emit('game-start');
        setTimeout(() => {
            io.to(roomId).emit('game-text', { text: randomText });
        }, 3000);

        console.log(`Game started in room ${roomId}`);
    });

    // ── Request game text (late joiners) ───────────────────────────────────────
    socket.on('request-game-text', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        if (room && room.gameText) {
            socket.emit('game-text', { text: room.gameText });
        }
    });

    // ── Player progress update ─────────────────────────────────────────────────
    socket.on('player-progress', (data) => {
        const { roomId, progress, wpm } = data;
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === socket.id);
        if (player) {
            player.progress = progress;
            player.wpm = wpm;
        }

        io.to(roomId).emit('player-progress', { players: room.players });
    });

    // ── Player finished ────────────────────────────────────────────────────────
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

        io.to(roomId).emit('player-finished', { playerId: socket.id, wpm, accuracy });

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
                await saveGameToDB(room);
            }, 2000);
        }
    });

    // ── Get game results ───────────────────────────────────────────────────────
    socket.on('get-game-results', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        if (room && room.results.length > 0) {
            socket.emit('game-end', { results: room.results });
        }
    });

    // ── Disconnect ─────────────────────────────────────────────────────────────
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
};

module.exports = registerGameSocket;
