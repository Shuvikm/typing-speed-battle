// In-memory quiz rooms
const quizRooms = new Map();

/**
 * Register all quiz-related socket events on a connected socket.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerQuizSocket = (socket, io) => {
    // ── Join quiz ──────────────────────────────────────────────────────────────
    socket.on('join-quiz', (data) => {
        const { quizId, playerName, avatar } = data;
        let quiz = quizRooms.get(quizId);

        if (!quiz) {
            quiz = { id: quizId, participants: [], started: false, leaderboard: [] };
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

    // ── Quiz complete ──────────────────────────────────────────────────────────
    socket.on('quiz-complete', (data) => {
        const { quizId, score, wpm, accuracy } = data;
        const quiz = quizRooms.get(quizId);

        if (quiz) {
            const participant = quiz.participants.find((p) => p.id === socket.id);
            if (participant) {
                participant.score = score;
                participant.wpm = wpm;
                participant.accuracy = accuracy;
            }

            quiz.leaderboard = [...quiz.participants].sort((a, b) => b.score - a.score);
            io.to(quizId).emit('quiz-result', { leaderboard: quiz.leaderboard });
        }
    });
};

module.exports = registerQuizSocket;
