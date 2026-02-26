/**
 * Socket.io service — single shared socket instance + all event name constants.
 * Import `socket` to interact with the server, import `socketEvents` for type-safe event names.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: false, // connect manually so components control lifecycle
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
});

socket.on('connect_error', (error) => {
    console.warn('⚠️  Socket connection error:', error.message);
});

// ─── Event name constants ─────────────────────────────────────────────────────
export const socketEvents = {
    // Room
    CREATE_ROOM: 'create-room',
    JOIN_ROOM: 'join-room',
    ROOM_CREATED: 'room-created',
    ROOM_JOINED: 'room-joined',
    ROOM_ERROR: 'room-error',
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',

    // Game
    START_GAME: 'start-game',
    GAME_START: 'game-start',
    GAME_TEXT: 'game-text',
    PLAYER_PROGRESS: 'player-progress',
    GAME_END: 'game-end',
    PLAYER_FINISHED: 'player-finished',
    GET_GAME_RESULTS: 'get-game-results',
    REQUEST_GAME_TEXT: 'request-game-text',

    // Quiz
    JOIN_QUIZ: 'join-quiz',
    QUIZ_JOINED: 'quiz-joined',
    QUIZ_STARTED: 'quiz-started',
    QUIZ_COMPLETE: 'quiz-complete',
    QUIZ_RESULT: 'quiz-result',

    // Status
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
};
