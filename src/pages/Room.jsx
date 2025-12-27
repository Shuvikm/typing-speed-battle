import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSocket, socketEvents } from '../utils/socket';
import { soundManager } from '../utils/sounds';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar, { avatars } from '../components/Avatar';

const Room = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'battle';
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('luffy');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);
    let currentRoomId = '';

    newSocket.on(socketEvents.CONNECT, () => {
      console.log('Connected to server');
      setIsConnected(true);
      soundManager.playSound('success');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on(socketEvents.ROOM_CREATED, (data) => {
      currentRoomId = data.roomId;
      setRoomId(data.roomId);
      setIsHost(true);
      setPlayers([{ id: newSocket.id, name: playerName, avatar: selectedAvatar }]);
      soundManager.playSound('success');
    });

    newSocket.on(socketEvents.ROOM_JOINED, (data) => {
      currentRoomId = data.roomId;
      setRoomId(data.roomId);
      setPlayers(data.players);
      soundManager.playSound('success');
    });

    newSocket.on(socketEvents.PLAYER_JOINED, (data) => {
      setPlayers(data.players);
    });

    newSocket.on(socketEvents.PLAYER_LEFT, (data) => {
      setPlayers(data.players);
    });

    newSocket.on(socketEvents.GAME_START, () => {
      setGameStarting(true);
      setTimeout(() => {
        navigate(`/game?roomId=${currentRoomId || roomId}&mode=${mode}`);
      }, 3000);
    });

    newSocket.on(socketEvents.ROOM_ERROR, (error) => {
      alert(error.message);
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      soundManager.playSound('error');
      alert('Please enter your name!');
      return;
    }
    if (!socket || !socket.connected) {
      soundManager.playSound('error');
      alert('Not connected to server. Please wait...');
      return;
    }
    soundManager.playSound('click');
    socket.emit(socketEvents.CREATE_ROOM, {
      playerName,
      avatar: selectedAvatar,
      mode,
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      soundManager.playSound('error');
      alert('Please enter your name and room ID!');
      return;
    }
    if (!socket || !socket.connected) {
      soundManager.playSound('error');
      alert('Not connected to server. Please wait...');
      return;
    }
    soundManager.playSound('click');
    socket.emit(socketEvents.JOIN_ROOM, {
      roomId,
      playerName,
      avatar: selectedAvatar,
    });
  };

  const handleStartGame = () => {
    if (!socket || !socket.connected) {
      soundManager.playSound('error');
      alert('Not connected to server. Please wait...');
      return;
    }
    if (isHost && players.length >= (mode === 'battle' ? 2 : 1)) {
      soundManager.playSound('success');
      socket.emit(socketEvents.START_GAME, { roomId });
    }
  };

  if (gameStarting) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-glow-blue mb-4 animate-pulse-neon">
            BATTLE STARTING...
          </h1>
          <div className="text-4xl animate-bounce">⚔️</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern relative">
      {/* Thousand Sunny Deck Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-blue-900/30 to-dark-bg opacity-50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-glow-blue mb-8">
            {mode === 'battle' ? '⚔️ Battle Room ⚔️' : '🎯 Solo Practice 🎯'}
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Player Setup */}
            <Card glow>
              <h2 className="text-2xl font-bold mb-4 text-neon-blue">Your Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pirate Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Choose Your Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.keys(avatars).map((name) => (
                    <Avatar
                      key={name}
                      name={name}
                      selected={selectedAvatar === name}
                      onClick={() => {
                        setSelectedAvatar(name);
                        soundManager.playSound('click');
                      }}
                      size="md"
                    />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Room Actions */}
            <Card glow>
              <h2 className="text-2xl font-bold mb-4 text-neon-purple">Room Actions</h2>
              
              <div className="space-y-4">
                <div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim() || !isConnected}
                  >
                    🏴‍☠️ Create New Room
                  </Button>
                  {!isConnected && (
                    <p className="text-xs text-red-400 mt-2 text-center">
                      ⚠️ Backend server not running. Start it with: npm run server
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-sm text-gray-400 mb-2">Join Room ID</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID..."
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-3 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomId.trim() || !isConnected}
                  >
                    🚪 Join Room
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Players List */}
          {roomId && (
            <Card className="mt-6">
              <h2 className="text-2xl font-bold mb-4 text-pirate-yellow">
                Crew Members ({players.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <Avatar name={player.avatar} size="lg" />
                    <p className="mt-2 text-sm font-bold">{player.name}</p>
                    {player.id === socket?.id && (
                      <span className="text-xs text-neon-blue">(You)</span>
                    )}
                  </div>
                ))}
              </div>

              {isHost && mode === 'battle' && (
                <div className="mt-6 text-center">
                  <Button
                    variant="pirate"
                    size="lg"
                    onClick={handleStartGame}
                    disabled={players.length < 2 || !isConnected}
                  >
                    {!isConnected
                      ? '🔴 Connect to server first'
                      : players.length < 2
                      ? '⏳ Waiting for opponent...'
                      : '🚀 Start Battle!'}
                  </Button>
                </div>
              )}

              {mode === 'solo' && roomId && (
                <div className="mt-6 text-center">
                  <Button
                    variant="pirate"
                    size="lg"
                    onClick={() => navigate(`/game?roomId=${roomId}&mode=solo`)}
                  >
                    🎯 Start Practice
                  </Button>
                </div>
              )}
            </Card>
          )}

          <div className="mt-6 text-center">
            <Button variant="secondary" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;

