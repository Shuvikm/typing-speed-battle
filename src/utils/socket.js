import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export const createSocket = () => {
  const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error.message);
  });

  return socket;
};

export const socketEvents = {
  // Room events
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_ERROR: 'room-error',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  
  // Game events
  START_GAME: 'start-game',
  GAME_START: 'game-start',
  GAME_TEXT: 'game-text',
  PLAYER_PROGRESS: 'player-progress',
  GAME_END: 'game-end',
  PLAYER_FINISHED: 'player-finished',
  
  // Quiz events
  JOIN_QUIZ: 'join-quiz',
  QUIZ_JOINED: 'quiz-joined',
  QUIZ_STARTED: 'quiz-started',
  QUIZ_COMPLETE: 'quiz-complete',
  QUIZ_RESULT: 'quiz-result',
  
  // Status
  DISCONNECT: 'disconnect',
  CONNECT: 'connect',
};

